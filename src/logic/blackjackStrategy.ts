import { Card, PlayerHand, HighlightParams, GameHistoryEntry, DealerActionLogEntry, SessionStats } from './blackjackTypes';
import { VALUES, GAME_RULES } from './blackjackConstants';
import { calculateHandValue } from './blackjackUtils';

export function getStrategyKeysForHighlight(playerHandObj: PlayerHand | null, dealerCards: Card[], isDealerCardHidden: boolean): HighlightParams {
  if (!playerHandObj || playerHandObj.cards.length === 0 || !dealerCards || dealerCards.length === 0) {
    return { type: null, playerKey: null, dealerKey: null };
  }
  const dealerUpCard = isDealerCardHidden ? dealerCards[1] : dealerCards[0];
  if (!dealerUpCard) return { type: null, playerKey: null, dealerKey: null };

  const dealerRank = dealerUpCard.rank;
  let tempDealerKey = (['K', 'Q', 'J'].includes(dealerRank)) ? 'T' : dealerRank;
  if (!['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A'].includes(tempDealerKey)) tempDealerKey = null as any;
  const dealerKey = tempDealerKey as HighlightParams['dealerKey'];

  const playerCards = playerHandObj.cards;
  const numPlayerCards = playerCards.length;
  const playerValue = calculateHandValue(playerCards);
  let type = null, playerKey = null;

  if (numPlayerCards === 2 && playerCards[0].rank === playerCards[1].rank) {
    type = 'pairs';
    const rank = playerCards[0].rank;
    const rankStr = (['K', 'Q', 'J'].includes(rank)) ? 'T' : rank;
    playerKey = `${rankStr},${rankStr}`;
    if (!['A,A', 'T,T', '9,9', '8,8', '7,7', '6,6', '5,5', '4,4', '3,3', '2,2'].includes(playerKey)) {
      type = null; playerKey = null;
    }
  } else {
    let hasAce = false, nonAceTotal = 0, aceCount = 0;
    playerCards.forEach(card => {
      if (card.rank === 'A') { hasAce = true; aceCount++; }
      else { nonAceTotal += VALUES[card.rank]; }
    });
    if (hasAce && playerValue > nonAceTotal + aceCount) {
      type = 'soft';
      const otherValue = playerValue - 11;
      if (otherValue >= 2 && otherValue <= 9) playerKey = `A,${otherValue}`;
      else { type = null; playerKey = null; }
    } else {
      type = 'hard';
      if (playerValue >= 17) playerKey = '17+';
      else if (playerValue <= 7 && playerValue >= 5) playerKey = '5-7';
      else if (playerValue < 5) playerKey = '5-7';
      else playerKey = playerValue.toString();
      if (!['17+', '16', '15', '14', '13', '12', '11', '10', '9', '8', '5-7'].includes(playerKey)) {
         playerKey = null;
      }
    }
  }
  return { type: type as HighlightParams['type'], playerKey, dealerKey };
}
