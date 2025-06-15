/**
 * Game rules configuration for Blackjack Trainer
 */

import { GameRules } from '../game/gameTypes';

/**
 * Default game rules for blackjack
 */
export const GAME_RULES: GameRules = {
  DEALER_STANDS_ON_SOFT_17: true, // True if dealer stands on soft 17, false if dealer hits
  DOUBLE_AFTER_SPLIT_ALLOWED: true, // True if doubling down after splitting is allowed
  MAX_SPLIT_HANDS: 4, // Maximum number of hands a player can split to
};
