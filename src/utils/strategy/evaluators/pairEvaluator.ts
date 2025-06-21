// Pair splitting strategy evaluation

import { StrategyAction } from '../../../types/strategy';
import { PAIRS_CHART } from '../../../data/strategyCharts';

/**
 * Gets strategy action from pair splitting chart
 */
export function getPairStrategyAction(rank: string, dealerColumnIndex: number): StrategyAction {
    const row = PAIRS_CHART.rows.find(r => r.label === rank);

    if (!row) return 'H';

    return row.actions[dealerColumnIndex] || 'H';
}
