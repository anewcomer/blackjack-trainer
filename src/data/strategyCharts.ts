// Basic strategy charts for blackjack
// Based on standard basic strategy for single deck, dealer stands on soft 17

import { StrategyTable, StrategyAction } from '../types/strategy';

/**
 * Hard totals strategy chart (hands without aces or with aces counted as 1)
 * Rows represent player totals (8-21), columns represent dealer upcards (2-10, A)
 */
export const HARD_TOTALS_CHART: StrategyTable = {
  type: 'HARD',
  title: 'Hard Totals',
  rows: [
    {
      playerValue: 8,
      label: '8 or less',
      actions: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'] // Always hit
    },
    {
      playerValue: 9,
      label: '9',
      actions: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] // Double 3-6, otherwise hit
    },
    {
      playerValue: 10,
      label: '10',
      actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'] // Double 2-9, hit vs 10,A
    },
    {
      playerValue: 11,
      label: '11',
      actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H'] // Double vs all except A
    },
    {
      playerValue: 12,
      label: '12',
      actions: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] // Stand 4-6, otherwise hit
    },
    {
      playerValue: 13,
      label: '13',
      actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] // Stand 2-6, otherwise hit
    },
    {
      playerValue: 14,
      label: '14',
      actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] // Stand 2-6, otherwise hit
    },
    {
      playerValue: 15,
      label: '15',
      actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'R', 'H'] // Stand 2-6, surrender vs 10
    },
    {
      playerValue: 16,
      label: '16',
      actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'R', 'R'] // Stand 2-6, surrender vs 9,10,A
    },
    {
      playerValue: 17,
      label: '17+',
      actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] // Always stand
    }
  ]
};

/**
 * Soft totals strategy chart (hands with ace counted as 11)
 * Rows represent ace + other card (A,2 through A,9), columns represent dealer upcards
 */
export const SOFT_TOTALS_CHART: StrategyTable = {
  type: 'SOFT',
  title: 'Soft Totals',
  rows: [
    {
      playerValue: 13, // A,2
      label: 'A,2',
      actions: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] // Double vs 5,6
    },
    {
      playerValue: 14, // A,3
      label: 'A,3',
      actions: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] // Double vs 5,6
    },
    {
      playerValue: 15, // A,4
      label: 'A,4',
      actions: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] // Double vs 4,5,6
    },
    {
      playerValue: 16, // A,5
      label: 'A,5',
      actions: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] // Double vs 4,5,6
    },
    {
      playerValue: 17, // A,6
      label: 'A,6',
      actions: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] // Double vs 3,4,5,6
    },
    {
      playerValue: 18, // A,7
      label: 'A,7',
      actions: ['S', 'D', 'D', 'D', 'D', 'S', 'S', 'H', 'H', 'H'] // Double vs 3-6, stand vs 2,7,8, hit vs 9,10,A
    },
    {
      playerValue: 19, // A,8
      label: 'A,8',
      actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] // Always stand
    },
    {
      playerValue: 20, // A,9
      label: 'A,9',
      actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] // Always stand
    }
  ]
};

/**
 * Pair splitting strategy chart
 * Rows represent pairs (A,A through 10,10), columns represent dealer upcards
 */
export const PAIRS_CHART: StrategyTable = {
  type: 'PAIRS',
  title: 'Pair Splitting',
  rows: [
    {
      playerValue: 2, // 2,2
      label: '2,2',
      actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] // Split vs 2-7
    },
    {
      playerValue: 3, // 3,3
      label: '3,3',
      actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] // Split vs 2-7
    },
    {
      playerValue: 4, // 4,4
      label: '4,4',
      actions: ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'] // Split vs 5,6 only
    },
    {
      playerValue: 5, // 5,5
      label: '5,5',
      actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'] // Never split, treat as 10
    },
    {
      playerValue: 6, // 6,6
      label: '6,6',
      actions: ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'] // Split vs 2-6
    },
    {
      playerValue: 7, // 7,7
      label: '7,7',
      actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] // Split vs 2-7
    },
    {
      playerValue: 8, // 8,8
      label: '8,8',
      actions: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] // Always split
    },
    {
      playerValue: 9, // 9,9
      label: '9,9',
      actions: ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'] // Split except vs 7,10,A
    },
    {
      playerValue: 10, // 10,10 (and face cards)
      label: '10,10',
      actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] // Never split
    },
    {
      playerValue: 11, // A,A
      label: 'A,A',
      actions: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] // Always split
    }
  ]
};

/**
 * Complete strategy chart data
 */
export const STRATEGY_CHARTS = {
  hard: HARD_TOTALS_CHART,
  soft: SOFT_TOTALS_CHART,
  pairs: PAIRS_CHART,
} as const;

/**
 * Dealer upcard labels for table headers
 */
export const DEALER_UPCARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

/**
 * Action labels and descriptions
 */
export const ACTION_DESCRIPTIONS: Record<StrategyAction, { label: string; description: string; color: string }> = {
  'H': {
    label: 'Hit',
    description: 'Take another card',
    color: '#f44336' // Red
  },
  'S': {
    label: 'Stand',
    description: 'Keep current total',
    color: '#4caf50' // Green
  },
  'D': {
    label: 'Double',
    description: 'Double bet and take one card',
    color: '#2196f3' // Blue
  },
  'P': {
    label: 'Split',
    description: 'Split pair into two hands',
    color: '#ff9800' // Orange
  },
  'R': {
    label: 'Surrender',
    description: 'Forfeit half bet and end hand',
    color: '#9c27b0' // Purple
  }
};

/**
 * Gets the strategy action for a specific situation
 */
export function getStrategyAction(
  tableType: 'HARD' | 'SOFT' | 'PAIRS',
  playerValue: number,
  dealerUpcard: number // 2-10 (with 1 representing Ace)
): StrategyAction {
  const dealerIndex = dealerUpcard === 1 ? 9 : dealerUpcard - 2; // Convert to array index

  let chart: StrategyTable;
  switch (tableType) {
    case 'HARD':
      chart = HARD_TOTALS_CHART;
      break;
    case 'SOFT':
      chart = SOFT_TOTALS_CHART;
      break;
    case 'PAIRS':
      chart = PAIRS_CHART;
      break;
  }

  // Find the appropriate row
  let row = chart.rows.find(r => r.playerValue === playerValue);

  // For hard totals, use the closest available row
  if (!row && tableType === 'HARD') {
    if (playerValue <= 8) {
      row = chart.rows[0]; // Use "8 or less" row
    } else if (playerValue >= 17) {
      row = chart.rows[chart.rows.length - 1]; // Use "17+" row
    }
  }

  if (!row || dealerIndex < 0 || dealerIndex >= row.actions.length) {
    return 'H'; // Default to hit if not found
  }

  return row.actions[dealerIndex];
}

/**
 * Gets all strategy charts for export/display
 */
export function getAllStrategyCharts() {
  return {
    hardTotals: HARD_TOTALS_CHART,
    softTotals: SOFT_TOTALS_CHART,
    pairs: PAIRS_CHART,
    dealerUpcards: DEALER_UPCARDS,
    actionDescriptions: ACTION_DESCRIPTIONS,
  };
}
