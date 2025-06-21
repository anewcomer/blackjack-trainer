// Soft hand strategy evaluation

import { StrategyAction } from '../../../types/strategy';
import { SOFT_TOTALS_CHART } from '../../../data/strategyCharts';

/**
 * Gets strategy action from soft totals chart
 */
export function getSoftHandStrategyAction(playerValue: number, dealerColumnIndex: number): StrategyAction {
    // Soft hands: A,2 (13) to A,9 (20)
    const softValue = playerValue - 11; // Remove the ace's 11 value
    const row = SOFT_TOTALS_CHART.rows.find(r => r.playerValue === softValue);

    if (!row) return playerValue >= 19 ? 'S' : 'H';

    return row.actions[dealerColumnIndex] || 'H';
}
