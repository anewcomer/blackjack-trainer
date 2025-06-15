import { useState, useCallback } from 'react';
import { GameHistoryEntry, SessionStats, PlayerHand, Card, DealerActionLogEntry } from '../logic/blackjackTypes';
import { calculateHandValue } from '../logic/blackjackUtils';

/**
 * Hook for managing game history and statistics
 * 
 * @param gameState The current game state
 * @param gameActions Game action functions
 * @returns Game history and related functions
 */
export const useGameHistory = (gameState: any, gameActions: any) => {
  // Game history state
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    correctMoves: 0, 
    incorrectMoves: 0, 
    totalDecisions: 0,
    wins: 0, 
    losses: 0, 
    pushes: 0, 
    handsPlayed: 0
  });

  /**
   * Logs the round to history
   */
  const logRoundToHistory = useCallback((
    resolvedPlayerHands: PlayerHand[], 
    finalDealerHand: Card[], 
    finalDealerActionsLog: DealerActionLogEntry[], 
    dealerBlackjack: boolean, 
    playerBlackjackOnInit: boolean
  ) => {
    const roundEntry: GameHistoryEntry = {
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
  }, []);

  /**
   * Update session statistics based on player actions
   */
  const updateSessionStats = useCallback((wasCorrect: boolean) => {
    setSessionStats(prev => ({
      ...prev,
      correctMoves: wasCorrect ? prev.correctMoves + 1 : prev.correctMoves,
      incorrectMoves: !wasCorrect ? prev.incorrectMoves + 1 : prev.incorrectMoves,
      totalDecisions: prev.totalDecisions + 1,
    }));
  }, []);

  /**
   * Show history modal
   */
  const showHistoryHandler = useCallback(() => {
    setShowHistoryModal(true);
  }, []);

  /**
   * Close history modal
   */
  const closeHistoryModalHandler = useCallback(() => {
    setShowHistoryModal(false);
  }, []);

  /**
   * Reset session statistics
   */
  const resetSessionStats = useCallback(() => {
    setSessionStats({
      correctMoves: 0, 
      incorrectMoves: 0, 
      totalDecisions: 0,
      wins: 0, 
      losses: 0, 
      pushes: 0, 
      handsPlayed: 0
    });
    gameState.setMessage("Session stats reset. Click 'New Game'.");
  }, [gameState]);

  return {
    gameHistory,
    setGameHistory,
    showHistoryModal,
    setShowHistoryModal,
    sessionStats,
    setSessionStats,
    logRoundToHistory,
    updateSessionStats,
    showHistoryHandler,
    closeHistoryModalHandler,
    resetSessionStats
  };
};
