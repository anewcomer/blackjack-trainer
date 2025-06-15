/**
 * Types related to game history and statistics
 */

/**
 * Session statistics tracking
 */
export interface SessionStats {
  correctMoves: number;
  incorrectMoves: number;
  totalDecisions: number;
  wins: number;
  losses: number;
  pushes: number;
  handsPlayed: number;
}

/**
 * Represents a player's hand in the history view
 */
export interface PlayerHandHistoryForModal {
  initialCards: string;
  actions: Array<{
    action: string;
    optimal: string;
    correct: boolean;
    valueBefore: number;
    valueAfter: number;
    cardDealt: string | null;
  }>;
  finalCards: string;
  finalScore: number;
  outcome: 'Win' | 'Loss' | 'Push' | null;
  busted: boolean;
  surrendered: boolean;
  isBlackjack: boolean;
}

/**
 * Complete entry for a game round in the history
 */
export interface GameHistoryEntry {
  id: number;
  timestamp: string;
  playerHands: PlayerHandHistoryForModal[];
  dealerUpCard: string;
  dealerHoleCard: string;
  dealerActions: Array<{
    action: string;
    valueBefore: number;
    valueAfter: number;
    cardDealt: string | null;
  }>;
  dealerFinalCards: string;
  dealerFinalScore: number;
  dealerBusted: boolean;
  dealerBlackjackOnInit: boolean;
  playerBlackjackOnInit: boolean;
}
