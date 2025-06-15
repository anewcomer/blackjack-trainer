/**
 * Strategy chart data for optimal blackjack play
 */

import { StrategyChart } from './strategyTypes';

/**
 * Strategy chart data
 * 
 * This data represents the optimal plays based on:
 * - Hard hands (no Ace counting as 11)
 * - Soft hands (hand with an Ace counting as 11)
 * - Pairs (first two cards are the same rank)
 */
export const strategyData: StrategyChart = {
  hard: {
    '5': { '2': 'hit', '3': 'hit', '4': 'hit', '5': 'hit', '6': 'hit', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '6': { '2': 'hit', '3': 'hit', '4': 'hit', '5': 'hit', '6': 'hit', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '7': { '2': 'hit', '3': 'hit', '4': 'hit', '5': 'hit', '6': 'hit', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '8': { '2': 'hit', '3': 'hit', '4': 'hit', '5': 'hit', '6': 'hit', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '9': { '2': 'hit', '3': 'double', '4': 'double', '5': 'double', '6': 'double', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '10': { '2': 'double', '3': 'double', '4': 'double', '5': 'double', '6': 'double', '7': 'double', '8': 'double', '9': 'double', 'T': 'hit', 'A': 'hit' },
    '11': { '2': 'double', '3': 'double', '4': 'double', '5': 'double', '6': 'double', '7': 'double', '8': 'double', '9': 'double', 'T': 'double', 'A': 'hit' },
    '12': { '2': 'hit', '3': 'hit', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '13': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '14': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '15': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'surrender', 'A': 'hit' },
    '16': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'hit', '8': 'hit', '9': 'surrender', 'T': 'surrender', 'A': 'surrender' },
    '17': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'stand', '8': 'stand', '9': 'stand', 'T': 'stand', 'A': 'stand' },
    '18': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'stand', '8': 'stand', '9': 'stand', 'T': 'stand', 'A': 'stand' },
    '19': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'stand', '8': 'stand', '9': 'stand', 'T': 'stand', 'A': 'stand' },
    '20': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'stand', '8': 'stand', '9': 'stand', 'T': 'stand', 'A': 'stand' }
  },
  soft: {
    'A,2': { '2': 'hit', '3': 'hit', '4': 'hit', '5': 'double', '6': 'double', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    'A,3': { '2': 'hit', '3': 'hit', '4': 'hit', '5': 'double', '6': 'double', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    'A,4': { '2': 'hit', '3': 'hit', '4': 'double', '5': 'double', '6': 'double', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    'A,5': { '2': 'hit', '3': 'hit', '4': 'double', '5': 'double', '6': 'double', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    'A,6': { '2': 'hit', '3': 'double', '4': 'double', '5': 'double', '6': 'double', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    'A,7': { '2': 'stand', '3': 'double', '4': 'double', '5': 'double', '6': 'double', '7': 'stand', '8': 'stand', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    'A,8': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'stand', '8': 'stand', '9': 'stand', 'T': 'stand', 'A': 'stand' },
    'A,9': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'stand', '8': 'stand', '9': 'stand', 'T': 'stand', 'A': 'stand' }
  },
  pairs: {
    'A,A': { '2': 'split', '3': 'split', '4': 'split', '5': 'split', '6': 'split', '7': 'split', '8': 'split', '9': 'split', 'T': 'split', 'A': 'split' },
    'T,T': { '2': 'stand', '3': 'stand', '4': 'stand', '5': 'stand', '6': 'stand', '7': 'stand', '8': 'stand', '9': 'stand', 'T': 'stand', 'A': 'stand' },
    '9,9': { '2': 'split', '3': 'split', '4': 'split', '5': 'split', '6': 'split', '7': 'stand', '8': 'split', '9': 'split', 'T': 'stand', 'A': 'stand' },
    '8,8': { '2': 'split', '3': 'split', '4': 'split', '5': 'split', '6': 'split', '7': 'split', '8': 'split', '9': 'split', 'T': 'split', 'A': 'split' },
    '7,7': { '2': 'split', '3': 'split', '4': 'split', '5': 'split', '6': 'split', '7': 'split', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '6,6': { '2': 'split', '3': 'split', '4': 'split', '5': 'split', '6': 'split', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '5,5': { '2': 'double', '3': 'double', '4': 'double', '5': 'double', '6': 'double', '7': 'double', '8': 'double', '9': 'double', 'T': 'hit', 'A': 'hit' },
    '4,4': { '2': 'hit', '3': 'hit', '4': 'hit', '5': 'split', '6': 'split', '7': 'hit', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '3,3': { '2': 'split', '3': 'split', '4': 'split', '5': 'split', '6': 'split', '7': 'split', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' },
    '2,2': { '2': 'split', '3': 'split', '4': 'split', '5': 'split', '6': 'split', '7': 'split', '8': 'hit', '9': 'hit', 'T': 'hit', 'A': 'hit' }
  }
};
