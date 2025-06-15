import React, { createContext, useContext, ReactNode } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { useGameHistory } from '../hooks/useGameHistory';
import { Card, PlayerHand, HighlightParams, GameHistoryEntry, SessionStats } from '../logic/blackjackTypes';
import { getHandScoreText } from '../logic/utils/cardUtils';

/**
 * The Blackjack context type definition, containing all game-related state and functions
 */
interface BlackjackContextType {
  // Game state
  playerHands: PlayerHand[];
  currentHandIndex: number;
  dealerHand: Card[];
  gameActive: boolean;
  message: string;
  hideDealerFirstCard: boolean;
  highlightParams: HighlightParams;
  
  // Game history and stats
  gameHistory: GameHistoryEntry[];
  showHistoryModal: boolean;
  sessionStats: SessionStats;
  
  // Game actions
  newGameHandler: () => void;
  hitHandler: () => void;
  standHandler: () => void;
  doubleHandler: () => void;
  splitHandler: () => void;
  surrenderHandler: () => void;
  showHistoryHandler: () => void;
  closeHistoryModalHandler: () => void;
  resetSessionStats: () => void;
  
  // Utility functions
  getHandScoreText: (cards: Card[]) => string;
  
  // Game state checks
  playerCanHit: boolean;
  playerCanStand: boolean;
  playerCanDouble: boolean;
  playerCanSplit: boolean;
  playerCanSurrender: boolean;
}

/**
 * Create the Blackjack context with default values
 */
const BlackjackContext = createContext<BlackjackContextType | undefined>(undefined);

/**
 * Props for the BlackjackProvider component
 */
interface BlackjackProviderProps {
  children: ReactNode;
}

/**
 * Provider component that makes Blackjack game state available to any
 * child component that calls the useBlackjack hook.
 */
export const BlackjackProvider: React.FC<BlackjackProviderProps> = ({ children }) => {
  // Import all the separated hooks
  const gameState = useGameState();
  const gameActions = useGameActions(gameState);
  const gameHistory = useGameHistory(gameState, gameActions);

  // Combine all the state and actions into one object
  const value = {
    ...gameState,
    ...gameActions,
    ...gameHistory,
    // Add utility functions not provided by the hooks
    getHandScoreText
  };

  return (
    <BlackjackContext.Provider value={value}>
      {children}
    </BlackjackContext.Provider>
  );
};

/**
 * Custom hook to use the Blackjack context
 */
export const useBlackjack = (): BlackjackContextType => {
  const context = useContext(BlackjackContext);
  if (context === undefined) {
    throw new Error('useBlackjack must be used within a BlackjackProvider');
  }
  return context;
};
