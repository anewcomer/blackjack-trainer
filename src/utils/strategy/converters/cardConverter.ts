// Card value conversions for strategy lookup

import { Card } from '../../../types/game';

/**
 * Gets dealer display value for strategy lookup (A=1, face cards=10)
 */
export function getDealerDisplayValue(dealerCard: Card): number {
    if (dealerCard.rank === 'A') return 1;
    if (['J', 'Q', 'K'].includes(dealerCard.rank)) return 10;
    return parseInt(dealerCard.rank);
}

/**
 * Converts dealer value to strategy table column index (0-based)
 */
export function getDealerColumnIndex(dealerValue: number): number {
    return dealerValue === 1 ? 9 : Math.max(0, Math.min(8, dealerValue - 2));
}

/**
 * Gets pair index for strategy table lookup
 */
export function getPairIndex(rank: string): number {
    const pairs = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    return pairs.indexOf(rank);
}
