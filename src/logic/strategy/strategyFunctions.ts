/**
 * Functions for determining optimal blackjack strategy
 */

import { Card } from '../game/cardTypes';
import { PlayerHand } from '../game/gameTypes';
import { HighlightParams } from './strategyTypes';
import { VALUES } from '../utils/cardUtils';
import { calculateHandValue } from '../utils/cardUtils';

/**
 * Determines the keys to use for highlighting the correct strategy in the strategy chart
 * 
 * @param playerHandObj - The player's current hand
 * @param dealerCards - The dealer's visible cards
 * @param isDealerCardHidden - Whether the dealer's first card is hidden
 * @returns Parameters for highlighting the correct cell in the strategy chart
 */
export function getStrategyKeysForHighlight(
  playerHandObj: PlayerHand | null, 
  dealerCards: Card[], 
  isDealerCardHidden: boolean
): HighlightParams {
  if (!playerHandObj || playerHandObj.cards.length === 0 || !dealerCards || dealerCards.length === 0) {
    return { type: null, playerKey: null, dealerKey: null };
  }
  
  // Get the appropriate dealer card based on whether the first card is hidden or not
  const dealerUpCard = isDealerCardHidden ? dealerCards[1] : dealerCards[0];
  if (!dealerUpCard) return { type: null, playerKey: null, dealerKey: null };

  // Normalize dealer card rank (10, J, Q, K all become T)
  const dealerRank = dealerUpCard.rank;
  let tempDealerKey = (['K', 'Q', 'J', '10'].includes(dealerRank)) ? 'T' : dealerRank;
  if (!['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A'].includes(tempDealerKey)) {
    console.warn(`Invalid dealer card rank for highlight: ${dealerRank}`);
    return { type: null, playerKey: null, dealerKey: null };
  }
  
  const dealerKey = tempDealerKey;
  const playerCards = playerHandObj.cards;
  const numPlayerCards = playerCards.length;
  const playerValue = calculateHandValue(playerCards);
  let type: 'hard' | 'soft' | 'pairs' | null = null;
  let playerKey: string | null = null;

  // Check for pairs first
  if (numPlayerCards === 2 && playerCards[0].rank === playerCards[1].rank) {
    type = 'pairs';
    const rank = playerCards[0].rank;
    const rankStr = (['K', 'Q', 'J', '10'].includes(rank)) ? 'T' : rank;
    playerKey = `${rankStr},${rankStr}`;
    if (!['A,A', 'T,T', '9,9', '8,8', '7,7', '6,6', '5,5', '4,4', '3,3', '2,2'].includes(playerKey)) {
      console.warn(`Invalid pair for highlight: ${playerKey}`);
      return { type: null, playerKey: null, dealerKey: null };
    }
  } else {
    // Check for soft hands (hand with an Ace counted as 11)
    let hasAce = false, nonAceTotal = 0, aceCount = 0;
    playerCards.forEach((card: Card) => {
      if (card.rank === 'A') { hasAce = true; aceCount++; }
      else { nonAceTotal += VALUES[card.rank]; }
    });
    
    if (hasAce && playerValue === nonAceTotal + aceCount + 10) { // Ace is being counted as 11
      type = 'soft';
      const otherValue = playerValue - 11; // Value excluding the Ace counted as 11
      if (otherValue >= 2 && otherValue <= 9) {
        playerKey = `A,${otherValue}`;
      } else {
        console.warn(`Invalid soft hand value for highlight: A,${otherValue}`);
        return { type: null, playerKey: null, dealerKey: null };
      }
    } else { // Hard hand
      type = 'hard';
      if (playerValue >= 5 && playerValue <= 20) {
        playerKey = playerValue.toString();
      } else {
        console.warn(`Invalid hard hand value for highlight: ${playerValue}`);
        return { type: null, playerKey: null, dealerKey: null };
      }
    }
  }

  return { type, playerKey, dealerKey };
}

/**
 * Determines the optimal play for the current hand situation
 * 
 * @param playerCards - The player's current cards
 * @param dealerUpCard - The dealer's visible card
 * @param isDealerCardHidden - Whether the dealer's first card is hidden
 * @param isSplitHand - Whether this hand is a result of a split
 * @param hasMultipleHands - Whether the player has multiple hands active
 * @returns The optimal action to take ('hit', 'stand', 'double', 'split', 'surrender')
 */
export function getOptimalPlay(
  playerCards: Card[], 
  dealerUpCard: Card, 
  isDealerCardHidden: boolean, 
  isSplitHand: boolean = false,
  hasMultipleHands: boolean = false
): string {
  // Get the strategy keys for the current situation
  const { type, playerKey, dealerKey } = getStrategyKeysForHighlight(
    {
      cards: playerCards,
      busted: false,
      stood: false,
      doubled: false,
      splitFromPair: isSplitHand,
      surrendered: false,
      isBlackjack: false,
      outcome: null,
      initialCardsForThisHand: playerCards,
      actionsTakenLog: []
    }, 
    [dealerUpCard], 
    false
  );
  
  // If we couldn't determine a strategy, default to hit
  if (!type || !playerKey || !dealerKey) return 'hit';
  
  // Import the strategy data
  const { strategyData } = require('./strategyData');
  
  // Get the recommended play from the strategy chart
  let recommendedPlay = strategyData[type][playerKey]?.[dealerKey] || 'hit';
  
  // Handle special cases
  
  // Can't double or split if not the first action
  if (playerCards.length > 2 && (recommendedPlay === 'double' || recommendedPlay === 'split')) {
    recommendedPlay = 'hit';
  }
  
  // Can't surrender if not the first action or if there are multiple hands
  if (recommendedPlay === 'surrender' && (playerCards.length > 2 || hasMultipleHands)) {
    recommendedPlay = 'hit';
  }
  
  // If this is a split hand, follow any restrictions
  if (isSplitHand) {
    // For example, some casinos don't allow doubling after split
    // if (!GAME_RULES.DOUBLE_AFTER_SPLIT_ALLOWED && recommendedPlay === 'double') {
    //   recommendedPlay = 'hit';
    // }
  }
  
  return recommendedPlay;
}
