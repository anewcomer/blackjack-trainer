// Strategy table coordinates for highlighting

import { Card, PlayerHand } from '../../types/game';
import { getDealerDisplayValue, getDealerColumnIndex, getPairIndex } from './converters/cardConverter';

export interface StrategyCoordinates {
    table: 'HARD' | 'SOFT' | 'PAIRS';
    row: number;
    col: number;
}

/**
 * Gets the strategy cell coordinates for highlighting in strategy tables
 */
export function getStrategyCellCoordinates(
    playerHand: PlayerHand,
    dealerUpCard: Card
): StrategyCoordinates | null {
    const dealerValue = getDealerDisplayValue(dealerUpCard);
    const dealerIndex = getDealerColumnIndex(dealerValue);

    if (playerHand.cards.length === 2 &&
        playerHand.cards[0].rank === playerHand.cards[1].rank) {
        // Pairs table
        const pairValue = playerHand.cards[0].rank;
        const pairIndex = getPairIndex(pairValue);
        if (pairIndex !== -1) {
            return { table: 'PAIRS', row: pairIndex, col: dealerIndex };
        }
    }

    if (playerHand.isSoft) {
        // Soft hands table (A,2 to A,9)
        const softValue = playerHand.handValue - 11; // Subtract 11 for the Ace
        if (softValue >= 2 && softValue <= 9) {
            return { table: 'SOFT', row: softValue - 2, col: dealerIndex };
        }
    } else {
        // Hard hands table (8 to 21)
        const hardValue = playerHand.handValue;
        if (hardValue >= 8 && hardValue <= 21) {
            return { table: 'HARD', row: hardValue - 8, col: dealerIndex };
        }
    }

    return null;
}
