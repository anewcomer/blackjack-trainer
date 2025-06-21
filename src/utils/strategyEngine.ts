// Strategy engine for basic blackjack strategy evaluation

import { Card, PlayerHand, DealerHand, ActionType } from '../types/game';
import { StrategyDecision, StrategyAction } from '../types/strategy';
import { calculateHandValue, isSoftHand, canSplit } from './cardUtils';
import { GAME_CONFIG } from './constants';

/**
 * Converts ActionType to StrategyAction
 */
function actionTypeToStrategyAction(action: ActionType): StrategyAction {
  switch (action) {
    case 'HIT': return 'H';
    case 'STAND': return 'S';
    case 'DOUBLE': return 'D';
    case 'SPLIT': return 'P';
    case 'SURRENDER': return 'R';
    default: return 'H';
  }
}

/**
 * Converts StrategyAction to ActionType
 */
function strategyActionToActionType(action: StrategyAction): ActionType {
  switch (action) {
    case 'H': return 'HIT';
    case 'S': return 'STAND';
    case 'D': return 'DOUBLE';
    case 'P': return 'SPLIT';
    case 'R': return 'SURRENDER';
    default: return 'HIT';
  }
}

/**
 * Determines the optimal basic strategy action for a given situation
 */
export function getOptimalAction(
  playerHand: PlayerHand,
  dealerUpCard: Card,
  canDouble: boolean = true,
  canSplit: boolean = true,
  canSurrender: boolean = true
): ActionType {
  const playerValue = playerHand.handValue;
  const dealerValue = dealerUpCard.value === 11 ? 1 : Math.min(dealerUpCard.value, 10);
  const isSoft = playerHand.isSoft;
  const isPair = playerHand.cards.length === 2 && playerHand.cards[0].rank === playerHand.cards[1].rank;
  
  // Handle pairs first
  if (isPair && canSplit && playerHand.cards.length === 2) {
    const pairAction = getPairSplitAction(playerHand.cards[0].rank, dealerValue);
    if (pairAction === 'SPLIT') return 'SPLIT';
  }
  
  // Handle soft hands (with Ace counted as 11)
  if (isSoft) {
    return getSoftHandAction(playerValue, dealerValue, canDouble);
  }
  
  // Handle hard hands
  return getHardHandAction(playerValue, dealerValue, canDouble, canSurrender);
}

/**
 * Gets the optimal action for pair splitting
 */
function getPairSplitAction(rank: string, dealerValue: number): ActionType {
  switch (rank) {
    case 'A':
    case '8':
      return 'SPLIT'; // Always split Aces and 8s
    
    case '10':
    case 'J':
    case 'Q':
    case 'K':
    case '5':
      return 'STAND'; // Never split 10s or 5s
    
    case '4':
      return dealerValue >= 5 && dealerValue <= 6 ? 'SPLIT' : 'HIT';
    
    case '6':
      return dealerValue >= 2 && dealerValue <= 6 ? 'SPLIT' : 'HIT';
    
    case '7':
      return dealerValue >= 2 && dealerValue <= 7 ? 'SPLIT' : 'HIT';
    
    case '9':
      return (dealerValue >= 2 && dealerValue <= 6) || (dealerValue >= 8 && dealerValue <= 9) ? 'SPLIT' : 'STAND';
    
    case '2':
    case '3':
      return dealerValue >= 2 && dealerValue <= 7 ? 'SPLIT' : 'HIT';
    
    default:
      return 'HIT';
  }
}

/**
 * Gets the optimal action for soft hands (hands with Ace counted as 11)
 */
function getSoftHandAction(playerValue: number, dealerValue: number, canDouble: boolean): ActionType {
  // Soft 19-21: Always stand
  if (playerValue >= 19) return 'STAND';
  
  // Soft 18: Complex logic
  if (playerValue === 18) {
    if (dealerValue >= 2 && dealerValue <= 6) {
      return canDouble ? 'DOUBLE' : 'STAND';
    }
    if (dealerValue === 7 || dealerValue === 8) {
      return 'STAND';
    }
    return 'HIT'; // Against 9, 10, A
  }
  
  // Soft 17: Double against 3-6, otherwise hit
  if (playerValue === 17) {
    return (canDouble && dealerValue >= 3 && dealerValue <= 6) ? 'DOUBLE' : 'HIT';
  }
  
  // Soft 15-16: Double against 4-6, otherwise hit
  if (playerValue >= 15 && playerValue <= 16) {
    return (canDouble && dealerValue >= 4 && dealerValue <= 6) ? 'DOUBLE' : 'HIT';
  }
  
  // Soft 13-14: Double against 5-6, otherwise hit
  if (playerValue >= 13 && playerValue <= 14) {
    return (canDouble && dealerValue >= 5 && dealerValue <= 6) ? 'DOUBLE' : 'HIT';
  }
  
  // Soft 12 and below: Always hit
  return 'HIT';
}

/**
 * Gets the optimal action for hard hands
 */
function getHardHandAction(
  playerValue: number, 
  dealerValue: number, 
  canDouble: boolean, 
  canSurrender: boolean
): ActionType {
  // 21: Always stand
  if (playerValue >= 21) return 'STAND';
  
  // 17-20: Always stand
  if (playerValue >= 17) return 'STAND';
  
  // 16: Surrender against 9,10,A if possible, otherwise hit against 7+
  if (playerValue === 16) {
    if (canSurrender && (dealerValue >= 9 || dealerValue === 1)) {
      return 'SURRENDER';
    }
    return dealerValue >= 7 ? 'HIT' : 'STAND';
  }
  
  // 15: Surrender against 10 if possible, otherwise hit against 7+
  if (playerValue === 15) {
    if (canSurrender && dealerValue === 10) {
      return 'SURRENDER';
    }
    return dealerValue >= 7 ? 'HIT' : 'STAND';
  }
  
  // 13-14: Stand against 2-6, hit against 7+
  if (playerValue >= 13 && playerValue <= 14) {
    return dealerValue >= 2 && dealerValue <= 6 ? 'STAND' : 'HIT';
  }
  
  // 12: Stand against 4-6, hit otherwise
  if (playerValue === 12) {
    return dealerValue >= 4 && dealerValue <= 6 ? 'STAND' : 'HIT';
  }
  
  // 11: Always double if possible, otherwise hit
  if (playerValue === 11) {
    return canDouble ? 'DOUBLE' : 'HIT';
  }
  
  // 10: Double against 2-9, hit against 10,A
  if (playerValue === 10) {
    return (canDouble && dealerValue >= 2 && dealerValue <= 9) ? 'DOUBLE' : 'HIT';
  }
  
  // 9: Double against 3-6, hit otherwise
  if (playerValue === 9) {
    return (canDouble && dealerValue >= 3 && dealerValue <= 6) ? 'DOUBLE' : 'HIT';
  }
  
  // 8 and below: Always hit
  return 'HIT';
}

/**
 * Evaluates if a player's action matches the optimal strategy
 */
export function evaluatePlayerAction(
  playerAction: ActionType,
  playerHand: PlayerHand,
  dealerUpCard: Card,
  canDouble: boolean = true,
  canSplitPairs: boolean = true,
  canSurrender: boolean = true
): StrategyDecision {
  const optimalAction = getOptimalAction(
    playerHand,
    dealerUpCard,
    canDouble,
    canSplitPairs,
    canSurrender
  );
  
  const isCorrect = playerAction === optimalAction;
  
  // Determine if the action is acceptable (some actions are close enough)
  const isAcceptable = isCorrect || isAcceptableAlternative(
    playerAction,
    optimalAction,
    playerHand,
    dealerUpCard
  );
  
  return {
    playerHand: {
      cards: playerHand.cards.map(card => `${card.rank}${card.suit}`),
      value: playerHand.handValue,
      isSoft: playerHand.isSoft,
      isPair: playerHand.cards.length === 2 && playerHand.cards[0].rank === playerHand.cards[1].rank,
    },
    dealerUpcard: dealerUpCard.rank === 'A' ? 1 : Math.min(dealerUpCard.value, 10),
    availableActions: [playerAction], // This would come from getValidActions in practice
    optimalAction: actionTypeToStrategyAction(optimalAction),
    reasoning: getActionExplanation(optimalAction, playerHand, dealerUpCard),
  };
}

/**
 * Determines if a player action is an acceptable alternative to the optimal action
 */
function isAcceptableAlternative(
  playerAction: ActionType,
  optimalAction: ActionType,
  playerHand: PlayerHand,
  dealerUpCard: Card
): boolean {
  // If optimal is DOUBLE but player can't double, HIT is acceptable
  if (optimalAction === 'DOUBLE' && playerAction === 'HIT') {
    return true;
  }
  
  // If optimal is SURRENDER but player can't surrender, HIT is acceptable for hard 15-16
  if (optimalAction === 'SURRENDER' && playerAction === 'HIT') {
    return playerHand.handValue >= 15 && playerHand.handValue <= 16;
  }
  
  // If optimal is SPLIT but player can't split, use the non-split strategy
  if (optimalAction === 'SPLIT' && (playerAction === 'HIT' || playerAction === 'STAND')) {
    const nonSplitAction = getOptimalAction(playerHand, dealerUpCard, true, false, true);
    return playerAction === nonSplitAction;
  }
  
  return false;
}

/**
 * Provides an explanation for why an action is optimal
 */
function getActionExplanation(
  optimalAction: ActionType,
  playerHand: PlayerHand,
  dealerUpCard: Card
): string {
  const playerValue = playerHand.handValue;
  const dealerValue = dealerUpCard.rank === 'A' ? 'A' : dealerUpCard.value.toString();
  const handType = playerHand.isSoft ? 'soft' : 'hard';
  
  switch (optimalAction) {
    case 'HIT':
      if (playerValue <= 11) {
        return `Always hit ${handType} ${playerValue} - no risk of busting.`;
      }
      if (playerValue >= 17) {
        return `Hit ${handType} ${playerValue} against dealer ${dealerValue} - dealer has strong upcard.`;
      }
      return `Hit ${handType} ${playerValue} against dealer ${dealerValue} - basic strategy.`;
    
    case 'STAND':
      if (playerValue >= 17) {
        return `Stand on ${handType} ${playerValue} - strong hand.`;
      }
      return `Stand on ${handType} ${playerValue} against dealer ${dealerValue} - dealer likely to bust.`;
    
    case 'DOUBLE':
      return `Double ${handType} ${playerValue} against dealer ${dealerValue} - favorable situation for doubling down.`;
    
    case 'SPLIT':
      const rank = playerHand.cards[0].rank;
      if (rank === 'A') return 'Always split Aces - creates two strong starting hands.';
      if (rank === '8') return 'Always split 8s - escapes weak 16 total.';
      return `Split ${rank}s against dealer ${dealerValue} - mathematically favorable.`;
    
    case 'SURRENDER':
      return `Surrender ${handType} ${playerValue} against dealer ${dealerValue} - minimizes losses in unfavorable situation.`;
    
    default:
      return 'Basic strategy recommendation.';
  }
}

/**
 * Gets the strategy table category for a hand
 */
export function getStrategyTableType(playerHand: PlayerHand): 'HARD' | 'SOFT' | 'PAIRS' {
  if (playerHand.cards.length === 2 && playerHand.cards[0].rank === playerHand.cards[1].rank) {
    return 'PAIRS';
  }
  
  if (playerHand.isSoft) {
    return 'SOFT';
  }
  
  return 'HARD';
}

/**
 * Gets the row and column indices for strategy table highlighting
 */
export function getStrategyTableCell(
  playerHand: PlayerHand,
  dealerUpCard: Card
): { row: number; col: number; tableType: 'HARD' | 'SOFT' | 'PAIRS' } {
  const tableType = getStrategyTableType(playerHand);
  const dealerValue = dealerUpCard.rank === 'A' ? 1 : Math.min(dealerUpCard.value, 10);
  
  // Dealer columns: 2,3,4,5,6,7,8,9,10,A (indices 0-9)
  const col = dealerValue === 1 ? 9 : dealerValue - 2;
  
  let row = 0;
  
  switch (tableType) {
    case 'PAIRS':
      // Pairs: A,2,3,4,5,6,7,8,9,10 (indices 0-9)
      const rank = playerHand.cards[0].rank;
      if (rank === 'A') row = 0;
      else if (rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K') row = 9;
      else row = parseInt(rank) - 1;
      break;
      
    case 'SOFT':
      // Soft hands: A2 through A9 (indices 0-7 for values 13-20)
      row = playerHand.handValue - 13;
      break;
      
    case 'HARD':
      // Hard hands: 5 through 21 (but typically 8-21 shown)
      row = Math.max(0, playerHand.handValue - 8);
      break;
  }
  
  return { row, col, tableType };
}

/**
 * Determines if basic strategy allows an action in a given situation
 */
export function isActionAllowedByStrategy(
  action: ActionType,
  playerHand: PlayerHand,
  dealerUpCard: Card
): boolean {
  const optimalAction = getOptimalAction(playerHand, dealerUpCard);
  
  if (action === optimalAction) return true;
  
  return isAcceptableAlternative(action, optimalAction, playerHand, dealerUpCard);
}
