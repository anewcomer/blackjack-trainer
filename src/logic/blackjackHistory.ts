import { PlayerHand, Card, DealerActionLogEntry, GameHistoryEntry } from './blackjackTypes';
import { calculateHandValue } from './blackjackUtils';

export function logRoundToHistory(
  resolvedPlayerHands: PlayerHand[],
  finalDealerHand: Card[],
  finalDealerActionsLog: DealerActionLogEntry[],
  dealerBlackjack: boolean,
  playerBlackjackOnInit: boolean,
  setGameHistory: (cb: (prev: GameHistoryEntry[]) => GameHistoryEntry[]) => void
) {
  const roundEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    playerHands: resolvedPlayerHands.map(hand => ({
      initialCards: hand.initialCardsForThisHand.map(c => `${c.rank}${c.suit}`).join(', '),
      actions: hand.actionsTakenLog.map(log => ({
        action: log.playerAction,
        optimal: log.optimalAction,
        correct: log.wasCorrect,
        valueBefore: log.handValueBefore,
        valueAfter: log.handValueAfter,
        cardDealt: log.cardDealt ? `${log.cardDealt.rank}${log.cardDealt.suit}` : null,
      })),
      finalCards: hand.cards.map(c => `${c.rank}${c.suit}`).join(', '),
      finalScore: calculateHandValue(hand.cards),
      outcome: hand.outcome,
      busted: hand.busted,
      surrendered: hand.surrendered,
      isBlackjack: hand.isBlackjack,
    })),
    dealerUpCard: finalDealerHand.length > 0 ? `${finalDealerHand[0].rank}${finalDealerHand[0].suit}` : 'N/A',
    dealerHoleCard: finalDealerHand.length > 1 ? `${finalDealerHand[1].rank}${finalDealerHand[1].suit}` : 'N/A',
    dealerActions: finalDealerActionsLog.map(log => ({
      action: log.action,
      valueBefore: log.handValueBefore,
      valueAfter: log.handValueAfter,
      cardDealt: log.cardDealt ? `${log.cardDealt.rank}${log.cardDealt.suit}` : null,
    })),
    dealerFinalCards: finalDealerHand.map(c => `${c.rank}${c.suit}`).join(', '),
    dealerFinalScore: calculateHandValue(finalDealerHand),
    dealerBusted: calculateHandValue(finalDealerHand) > 21,
    dealerBlackjackOnInit: dealerBlackjack,
    playerBlackjackOnInit: playerBlackjackOnInit,
  };
  setGameHistory(prev => [...prev, roundEntry]);
}
