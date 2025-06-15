/**
 * Types related to the blackjack strategy
 */

/**
 * Parameters for highlighting the correct strategy in the strategy chart
 */
export interface HighlightParams {
  type: 'hard' | 'soft' | 'pairs' | null;
  playerKey: string | null;
  dealerKey: string | null;
}

/**
 * Strategy chart data structure
 */
export interface StrategyChart {
  hard: {
    [key: string]: { [key: string]: string };
  };
  soft: {
    [key: string]: { [key: string]: string };
  };
  pairs: {
    [key: string]: { [key: string]: string };
  };
}

/**
 * Player action types
 */
export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';
