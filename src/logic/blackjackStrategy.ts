import { Card, PlayerHand, HighlightParams } from './blackjackTypes';
import { VALUES } from './blackjackConstants';
import { calculateHandValue } from './blackjackUtils';

export function getStrategyKeysForHighlight(playerHandObj: PlayerHand | null, dealerCards: Card[], isDealerCardHidden: boolean): HighlightParams {
  console.log("getStrategyKeysForHighlight called with:", {
    playerHand: playerHandObj ? {
      cards: playerHandObj.cards.map(c => `${c.rank}${c.suit}`),
      value: playerHandObj.cards.length > 0 ? calculateHandValue(playerHandObj.cards) : 0
    } : null,
    dealerCards: dealerCards.map(c => `${c.rank}${c.suit}`),
    isDealerCardHidden
  });

  if (!playerHandObj || playerHandObj.cards.length === 0 || !dealerCards || dealerCards.length === 0) {
    console.warn("Invalid inputs for getStrategyKeysForHighlight");
    return { type: null, playerKey: null, dealerKey: null };
  }
  
  // Get the appropriate dealer card based on whether the first card is hidden or not
  const dealerUpCard = isDealerCardHidden ? dealerCards[1] : dealerCards[0];
  if (!dealerUpCard) {
    console.warn("No dealer up card available");
    return { type: null, playerKey: null, dealerKey: null };
  }

  console.log(`Dealer up card: ${dealerUpCard.rank}${dealerUpCard.suit}`);

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
  let type = null, playerKey = null;
  
  console.log(`Player hand: ${playerCards.map(c => `${c.rank}${c.suit}`).join(', ')}, value: ${playerValue}`);

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
    playerCards.forEach(card => {
      if (card.rank === 'A') { hasAce = true; aceCount++; }
      else { nonAceTotal += VALUES[card.rank]; }
    });
    
    if (hasAce && playerValue === nonAceTotal + aceCount + 10) { // Ace is being counted as 11
      type = 'soft';
      const otherValue = playerValue - 11; // Value excluding the Ace counted as 11
      if (otherValue >= 2 && otherValue <= 9) {
        playerKey = `A,${otherValue}`;
      } else {
        console.warn(`Invalid soft hand value for highlight: ${otherValue}`);
        return { type: null, playerKey: null, dealerKey: null };
      }
    } else {
      // Hard hand (no Ace or Ace counted as 1)
      type = 'hard';
      if (playerValue >= 17) playerKey = '17+';
      else if (playerValue <= 7) playerKey = '5-7';
      else playerKey = playerValue.toString();
      
      if (!['17+', '16', '15', '14', '13', '12', '11', '10', '9', '8', '5-7'].includes(playerKey)) {
        console.warn(`Invalid hard hand value for highlight: ${playerValue}`);
        return { type: null, playerKey: null, dealerKey: null };
      }
    }
  }
  
  // For debugging
  console.log(`Highlight params: type=${type}, playerKey=${playerKey}, dealerKey=${dealerKey}`);
  
  // Ensure type is properly typed as a valid HighlightParams['type']
  const typedType = type as HighlightParams['type'];
  const result = { type: typedType, playerKey, dealerKey };
  console.log("Returning highlight params:", result);
  return result;
}

export function getOptimalPlay(
  playerHandCards: Card[],
  dealerUpCard: Card,
  canSplitCurrent: boolean,
  canDoubleCurrent: boolean,
  canSurrenderCurrent: boolean
): string {
  const playerValue = calculateHandValue(playerHandCards);
  const dealerCardRank = dealerUpCard.rank;
  let isPlayerPair = playerHandCards.length === 2 && playerHandCards[0].rank === playerHandCards[1].rank;
  let isPlayerSoft = false;
  if (playerHandCards.some(c => c.rank === 'A')) {
    let nonAceTotal = 0;
    let aceCount = 0;
    playerHandCards.forEach(c => {
      if (c.rank === 'A') aceCount++; else nonAceTotal += VALUES[c.rank];
    });
    if (aceCount > 0 && (nonAceTotal + 11 + (aceCount - 1)) === playerValue && playerValue <= 21) {
      isPlayerSoft = true;
    }
  }
  if (canSurrenderCurrent && playerHandCards.length === 2 && !isPlayerPair) {
    if (playerValue === 16 && (dealerCardRank === '9' || ['10', 'J', 'Q', 'K'].includes(dealerCardRank) || dealerCardRank === 'A')) return 'R';
    if (playerValue === 15 && (['10', 'J', 'Q', 'K'].includes(dealerCardRank) || dealerCardRank === 'A')) return 'R';
  }
  if (isPlayerPair && canSplitCurrent) {
    const pRank = playerHandCards[0].rank;
    if (pRank === 'A' || pRank === '8') return 'P';
    if (['10', 'J', 'Q', 'K'].includes(pRank)) return 'S';
    if (pRank === '9') {
      if (['7', '10', 'J', 'Q', 'K', 'A'].includes(dealerCardRank)) return 'S';
      return 'P';
    }
    if (pRank === '7') return (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 7) ? 'P' : 'H';
    if (pRank === '6') return (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 6) ? 'P' : 'H';
    if (pRank === '5') {
      if (canDoubleCurrent && VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 9) return 'D';
      return 'H';
    }
    if (pRank === '4') {
      if ((VALUES[dealerCardRank] === 5 || VALUES[dealerCardRank] === 6)) return 'P';
      return 'H';
    }
    if (pRank === '3' || pRank === '2') {
      if (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 7) return 'P';
      return 'H';
    }
  }
  if (isPlayerSoft) {
    if (playerValue >= 20) return 'S';
    if (playerValue === 19) {
      return (canDoubleCurrent && VALUES[dealerCardRank] === 6) ? 'D' : 'S';
    }
    if (playerValue === 18) {
      if (canDoubleCurrent && VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 6) return 'D';
      if (VALUES[dealerCardRank] <= 8) return 'S';
      return 'H';
    }
    if (playerValue === 17) {
      if (canDoubleCurrent && VALUES[dealerCardRank] >= 3 && VALUES[dealerCardRank] <= 6) return 'D';
      return 'H';
    }
    if (playerValue === 16 || playerValue === 15) {
      if (canDoubleCurrent && VALUES[dealerCardRank] >= 4 && VALUES[dealerCardRank] <= 6) return 'D';
      return 'H';
    }
    if (playerValue === 14 || playerValue === 13) {
      if (canDoubleCurrent && VALUES[dealerCardRank] >= 5 && VALUES[dealerCardRank] <= 6) return 'D';
      return 'H';
    }
  }
  if (playerValue >= 17) return 'S';
  if (playerValue === 16 || playerValue === 15 || playerValue === 14 || playerValue === 13) {
    return (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 6) ? 'S' : 'H';
  }
  if (playerValue === 12) return (VALUES[dealerCardRank] >= 4 && VALUES[dealerCardRank] <= 6) ? 'S' : 'H';
  if (playerValue === 11) return canDoubleCurrent ? 'D' : 'H';
  if (playerValue === 10) return (canDoubleCurrent && VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 9) ? 'D' : 'H';
  if (playerValue === 9) return (canDoubleCurrent && VALUES[dealerCardRank] >= 3 && VALUES[dealerCardRank] <= 6) ? 'D' : 'H';
  return 'H';
}
