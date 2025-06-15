import { Card } from './blackjackTypes';
import { VALUES, GAME_RULES } from './blackjackConstants';
import { calculateHandValue } from './blackjackUtils';

export function getOptimalPlay(
  playerHandCards: Card[],
  dealerUpCard: Card,
  canSplitCurrent: boolean,
  canDoubleCurrent: boolean,
  canSurrenderCurrent: boolean
): string {
  const playerValue = calculateHandValue(playerHandCards);
  const dealerCardRank = dealerUpCard.rank;
  const isPlayerPair = playerHandCards.length === 2 && playerHandCards[0].rank === playerHandCards[1].rank;
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
      if (GAME_RULES.DOUBLE_AFTER_SPLIT_ALLOWED && (VALUES[dealerCardRank] === 5 || VALUES[dealerCardRank] === 6)) return 'P';
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
      return (canDoubleCurrent && VALUES[dealerCardRank] === 6 && GAME_RULES.DEALER_STANDS_ON_SOFT_17) ? 'D' : 'S';
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
