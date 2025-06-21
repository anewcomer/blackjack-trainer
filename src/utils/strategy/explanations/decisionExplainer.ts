// Strategy decision explanations

import { ActionType, PlayerHand } from '../../../types/game';
import { getActionName } from '../converters/actionConverter';

export type HandType = 'HARD' | 'SOFT' | 'PAIR';

/**
 * Gets hand type for strategy context
 */
export function getHandType(playerHand: PlayerHand): HandType {
    const isPair = playerHand.cards.length === 2 &&
        playerHand.cards[0].rank === playerHand.cards[1].rank;

    if (isPair) return 'PAIR';
    if (playerHand.isSoft) return 'SOFT';
    return 'HARD';
}

/**
 * Generates explanation for strategy decision
 */
export function getDecisionExplanation(
    playerAction: ActionType,
    optimalAction: ActionType,
    context: {
        playerHandType: HandType;
        playerValue: number;
        dealerValue: number;
    }
): string {
    if (playerAction === optimalAction) {
        return `Correct! ${getActionName(playerAction)} is the optimal strategy.`;
    }

    return `Incorrect. ${getActionName(optimalAction)} would be the optimal strategy for ${context.playerHandType.toLowerCase()} ${context.playerValue} vs dealer ${context.dealerValue}.`;
}
