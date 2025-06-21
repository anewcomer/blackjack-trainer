// Hard hand strategy evaluation

import { StrategyAction } from '../../../types/strategy';
import { HARD_TOTALS_CHART } from '../../../data/strategyCharts';

/**
 * Gets strategy action from hard totals chart
 */
export function getHardHandStrategyAction(playerValue: number, dealerColumnIndex: number): StrategyAction {
    // Find the appropriate row (clamp to chart bounds)
    const clampedValue = Math.max(8, Math.min(21, playerValue));
    const row = HARD_TOTALS_CHART.rows.find(r => r.playerValue === clampedValue);

    if (!row) return 'H';

    return row.actions[dealerColumnIndex] || 'H';
}
