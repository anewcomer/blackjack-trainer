// Game constants and configuration for the Blackjack Trainer

import { Suit, Rank } from '../types/game';

// Card definitions
export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Card values
export const RANK_VALUES: Record<Rank, number> = {
  'A': 11,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10,
};

// Game configuration
export const GAME_CONFIG = {
  // Standard blackjack rules
  BLACKJACK_VALUE: 21,
  DEALER_STANDS_ON: 17,
  MAX_SPLIT_HANDS: 4,
  
  // Rule variations (configurable)
  DEALER_HITS_SOFT_17: false,
  DOUBLE_AFTER_SPLIT_ALLOWED: true,
  SURRENDER_ALLOWED: true,
  RESPLIT_ACES_ALLOWED: false,
  
  // Deck configuration
  NUMBER_OF_DECKS: 1,
  RESHUFFLE_THRESHOLD: 0.25, // Reshuffle when 25% of cards remain
  
  // Animation timings (ms)
  CARD_DEAL_DELAY: 300,
  ACTION_FEEDBACK_DURATION: 2000,
  DEALER_ACTION_DELAY: 500,
} as const;

// Player actions
export const PLAYER_ACTIONS = {
  HIT: 'HIT',
  STAND: 'STAND',
  DOUBLE: 'DOUBLE',
  SPLIT: 'SPLIT',
  SURRENDER: 'SURRENDER',
} as const;

// Game phases
export const GAME_PHASES = {
  BETTING: 'BETTING',
  DEALING: 'DEALING',
  PLAYER_TURN: 'PLAYER_TURN',
  DEALER_TURN: 'DEALER_TURN',
  GAME_OVER: 'GAME_OVER',
} as const;

// Hand outcomes
export const HAND_OUTCOMES = {
  WIN: 'WIN',
  LOSE: 'LOSE',
  PUSH: 'PUSH',
  BLACKJACK: 'BLACKJACK',
  BUST: 'BUST',
  SURRENDER: 'SURRENDER',
} as const;

// Strategy action codes (for basic strategy charts)
export const STRATEGY_ACTIONS = {
  H: 'HIT',        // Hit
  S: 'STAND',      // Stand
  D: 'DOUBLE',     // Double (hit if not allowed)
  Ds: 'DOUBLE_STAND', // Double if allowed, otherwise stand
  P: 'SPLIT',      // Split
  R: 'SURRENDER',  // Surrender (hit if not allowed)
} as const;

// Feedback message types
export const FEEDBACK_TYPES = {
  CORRECT: 'CORRECT',
  INCORRECT: 'INCORRECT',
  OPTIMAL: 'OPTIMAL',
  SUBOPTIMAL: 'SUBOPTIMAL',
  GAME_RESULT: 'GAME_RESULT',
} as const;

// Screen size breakpoints (matching MUI breakpoints)
export const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 900,
  DESKTOP: 1200,
} as const;
