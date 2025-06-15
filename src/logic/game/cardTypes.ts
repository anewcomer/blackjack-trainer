/**
 * Types related to cards in the game
 */

/**
 * Represents a single playing card
 */
export interface Card {
  rank: string;
  suit: string;
  value: number;
  id: string;
}
