// Core game logic for the Blackjack Trainer application

import { 
  Card, 
  PlayerHand, 
  DealerHand, 
  ActionType, 
  HandOutcome, 
  GameResult,
  ActionLogEntry,
} from '../types/game';
import {
  calculateHandValue,
  isBlackjack,
  isBusted,
  canSplit,
  dealCard,
  createMultiDeck,
} from './cardUtils';
import { GAME_CONFIG, HAND_OUTCOMES } from './constants';

/**
 * Creates a new player hand
 */
export function createPlayerHand(
  cards: Card[] = [],
  splitFromPair: boolean = false,
  id?: string
): PlayerHand {
  const handId = id || `hand-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const { value, isSoft } = calculateHandValue(cards);
  
  return {
    id: handId,
    cards,
    busted: isBusted(cards),
    stood: false,
    doubled: false,
    splitFromPair,
    surrendered: false,
    isBlackjack: isBlackjack(cards),
    outcome: null,
    actionLog: [],
    handValue: value,
    isSoft,
  };
}

/**
 * Creates a new dealer hand
 */
export function createDealerHand(cards: Card[] = [], hideHoleCard: boolean = true): DealerHand {
  const { value, isSoft } = calculateHandValue(cards);
  
  return {
    cards,
    handValue: value,
    isSoft,
    hideHoleCard,
  };
}

/**
 * Updates a player hand with new cards and recalculates values
 */
export function updatePlayerHand(hand: PlayerHand, newCards?: Card[]): PlayerHand {
  const cards = newCards || hand.cards;
  const { value, isSoft } = calculateHandValue(cards);
  
  return {
    ...hand,
    cards,
    handValue: value,
    isSoft,
    busted: isBusted(cards),
    isBlackjack: isBlackjack(cards) && !hand.splitFromPair, // Splits can't be blackjack
  };
}

/**
 * Updates a dealer hand with new cards and recalculates values
 */
export function updateDealerHand(hand: DealerHand, newCards?: Card[], hideHoleCard?: boolean): DealerHand {
  const cards = newCards || hand.cards;
  const { value, isSoft } = calculateHandValue(cards);
  
  return {
    ...hand,
    cards,
    handValue: value,
    isSoft,
    hideHoleCard: hideHoleCard !== undefined ? hideHoleCard : hand.hideHoleCard,
  };
}

/**
 * Determines valid actions for a player hand
 */
export function getValidActions(
  hand: PlayerHand,
  dealerUpCard: Card,
  numberOfHands: number,
  canAffordDouble: boolean = true
): ActionType[] {
  const actions: ActionType[] = [];
  
  // Can't take any actions if hand is finished
  if (hand.busted || hand.stood || hand.isBlackjack || hand.surrendered) {
    return actions;
  }
  
  // Always can hit or stand (unless doubled)
  if (!hand.doubled) {
    actions.push('HIT', 'STAND');
  }
  
  // Can double on first two cards if affordable
  if (hand.cards.length === 2 && !hand.doubled && canAffordDouble) {
    actions.push('DOUBLE');
  }
  
  // Can split pairs if conditions are met
  if (
    hand.cards.length === 2 &&
    canSplit(hand.cards) &&
    numberOfHands < GAME_CONFIG.MAX_SPLIT_HANDS &&
    !hand.doubled
  ) {
    actions.push('SPLIT');
  }
  
  // Can surrender on first action of hand
  if (
    GAME_CONFIG.SURRENDER_ALLOWED &&
    hand.cards.length === 2 &&
    hand.actionLog.length === 0 &&
    numberOfHands === 1 // Can't surrender after split
  ) {
    actions.push('SURRENDER');
  }
  
  return actions;
}

/**
 * Processes a player action and returns updated hand with action log
 */
export function processPlayerAction(
  hand: PlayerHand,
  action: ActionType,
  optimalAction: ActionType,
  newCard?: Card
): { updatedHand: PlayerHand; actionLog: ActionLogEntry } {
  const actionLog: ActionLogEntry = {
    handId: hand.id,
    action,
    optimalAction,
    wasCorrect: action === optimalAction,
    timestamp: Date.now(),
    handValueBefore: hand.handValue,
    handValueAfter: hand.handValue,
    cardDealt: newCard || null,
  };
  
  let updatedHand = { ...hand };
  
  switch (action) {
    case 'HIT':
      if (newCard) {
        updatedHand = updatePlayerHand(hand, [...hand.cards, newCard]);
        actionLog.handValueAfter = updatedHand.handValue;
      }
      break;
      
    case 'STAND':
      updatedHand.stood = true;
      break;
      
    case 'DOUBLE':
      if (newCard) {
        updatedHand = updatePlayerHand(hand, [...hand.cards, newCard]);
        updatedHand.doubled = true;
        updatedHand.stood = true; // Auto-stand after double
        actionLog.handValueAfter = updatedHand.handValue;
      }
      break;
      
    case 'SURRENDER':
      updatedHand.surrendered = true;
      updatedHand.outcome = 'SURRENDER';
      break;
      
    case 'SPLIT':
      // Note: Split logic is handled at the game level
      // This just logs the action
      break;
  }
  
  // Add action to log
  updatedHand.actionLog = [...hand.actionLog, actionLog];
  
  return { updatedHand, actionLog };
}

/**
 * Determines if dealer should hit based on game rules
 */
export function shouldDealerHit(dealerHand: DealerHand): boolean {
  const { value, isSoft } = calculateHandValue(dealerHand.cards);
  
  if (value < GAME_CONFIG.DEALER_STANDS_ON) {
    return true;
  }
  
  // Dealer hits soft 17 if rule is enabled
  if (value === 17 && isSoft && GAME_CONFIG.DEALER_HITS_SOFT_17) {
    return true;
  }
  
  return false;
}

/**
 * Compares a player hand against dealer hand and determines outcome
 */
export function determineHandOutcome(
  playerHand: PlayerHand,
  dealerHand: DealerHand
): HandOutcome {
  // Handle special cases first
  if (playerHand.surrendered) return 'SURRENDER';
  if (playerHand.busted) return 'LOSS'; // Bust is a loss
  
  const playerValue = playerHand.handValue;
  const dealerValue = dealerHand.handValue;
  const playerBlackjack = playerHand.isBlackjack;
  const dealerBlackjack = isBlackjack(dealerHand.cards);
  
  // Blackjack comparisons
  if (playerBlackjack && dealerBlackjack) return 'PUSH';
  if (playerBlackjack && !dealerBlackjack) return 'BLACKJACK';
  if (!playerBlackjack && dealerBlackjack) return 'LOSS';
  
  // Dealer busted
  if (isBusted(dealerHand.cards)) return 'WIN';
  
  // Standard value comparison
  if (playerValue > dealerValue) return 'WIN';
  if (playerValue < dealerValue) return 'LOSS';
  return 'PUSH';
}

/**
 * Calculates payout multiplier for a hand outcome
 */
export function getPayoutMultiplier(outcome: HandOutcome): number {
  switch (outcome) {
    case 'BLACKJACK': return 1.5; // 3:2 payout
    case 'WIN': return 1.0;       // 1:1 payout
    case 'PUSH': return 0.0;      // No change
    case 'SURRENDER': return -0.5; // Lose half bet
    case 'LOSS':
    default: return -1.0;         // Lose full bet
  }
}

/**
 * Determines overall game result based on all hand outcomes
 */
export function determineGameResult(
  playerHands: PlayerHand[],
  dealerHand: DealerHand
): GameResult {
  const outcomes = playerHands.map(hand => determineHandOutcome(hand, dealerHand));
  
  let wins = 0;
  let losses = 0;
  let pushes = 0;
  let surrenders = 0;
  let blackjacks = 0;
  let busts = 0;
  
  outcomes.forEach(outcome => {
    switch (outcome) {
      case 'WIN':
        wins++;
        break;
      case 'LOSS':
        losses++;
        if (playerHands.find(hand => determineHandOutcome(hand, dealerHand) === outcome)?.busted) {
          busts++;
        }
        break;
      case 'PUSH':
        pushes++;
        break;
      case 'SURRENDER':
        surrenders++;
        break;
      case 'BLACKJACK':
        blackjacks++;
        break;
    }
  });
  
  return {
    playerHandsCount: playerHands.length,
    wins,
    losses,
    pushes,
    surrenders,
    blackjacks,
    busts,
  };
}

/**
 * Initializes a new game with shuffled deck and initial cards
 */
export function initializeNewGame(): {
  deck: Card[];
  playerHand: PlayerHand;
  dealerHand: DealerHand;
} {
  let deck = createMultiDeck(GAME_CONFIG.NUMBER_OF_DECKS);
  
  // Deal initial cards: player first, dealer first, player second, dealer second (hole card)
  const { card: playerCard1, remainingDeck: deck1 } = dealCard(deck);
  const { card: dealerCard1, remainingDeck: deck2 } = dealCard(deck1);
  const { card: playerCard2, remainingDeck: deck3 } = dealCard(deck2);
  const { card: dealerCard2, remainingDeck: finalDeck } = dealCard(deck3);
  
  if (!playerCard1 || !playerCard2 || !dealerCard1 || !dealerCard2) {
    throw new Error('Not enough cards to deal initial hand');
  }
  
  const playerHand = createPlayerHand([playerCard1, playerCard2]);
  const dealerHand = createDealerHand([dealerCard1, dealerCard2]);
  
  return {
    deck: finalDeck,
    playerHand,
    dealerHand,
  };
}

/**
 * Validates if a game action is legal in the current state
 */
export function isValidAction(
  action: ActionType,
  hand: PlayerHand,
  validActions: ActionType[]
): boolean {
  return validActions.includes(action);
}

/**
 * Creates a new hand for splitting pairs
 */
export function createSplitHand(originalHand: PlayerHand, splitCard: Card): PlayerHand {
  return createPlayerHand([splitCard], true);
}

/**
 * Checks if all player hands are finished (stood, busted, blackjack, or surrendered)
 */
export function areAllHandsFinished(hands: PlayerHand[]): boolean {
  return hands.every(hand => 
    hand.stood || 
    hand.busted || 
    hand.isBlackjack || 
    hand.surrendered
  );
}

/**
 * Gets the next active hand index for multi-hand play
 */
export function getNextActiveHandIndex(hands: PlayerHand[], currentIndex: number): number {
  for (let i = currentIndex; i < hands.length; i++) {
    const hand = hands[i];
    if (!hand.stood && !hand.busted && !hand.isBlackjack && !hand.surrendered) {
      return i;
    }
  }
  return -1; // No active hands
}
