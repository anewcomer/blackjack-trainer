/**
 * Types related to the game core functionality
 */

import { Card } from './cardTypes';

/**
 * Represents an entry in the action log for a player's move
 */
export interface ActionLogEntry {
  playerAction: string;
  optimalAction: string;
  wasCorrect: boolean;
  handValueBefore: number;
  handValueAfter: number;
  cardDealt: Card | null;
}

/**
 * Represents a player's hand in the game
 */
export interface PlayerHand {
  cards: Card[];
  busted: boolean;
  stood: boolean;
  doubled: boolean;
  splitFromPair: boolean;
  surrendered: boolean;
  isBlackjack: boolean;
  outcome: 'Win' | 'Loss' | 'Push' | null;
  initialCardsForThisHand: Card[];
  actionsTakenLog: ActionLogEntry[];
}

/**
 * Represents an entry in the dealer's action log
 */
export interface DealerActionLogEntry {
  action: string;
  handValueBefore: number;
  handValueAfter: number;
  cardDealt?: Card | null;
}

/**
 * Game rules configuration
 */
export interface GameRules {
  DEALER_STANDS_ON_SOFT_17: boolean;
  DOUBLE_AFTER_SPLIT_ALLOWED: boolean;
  MAX_SPLIT_HANDS: number;
}
