// Main strategy engine with clean public API

import { Card, PlayerHand, ActionType } from '../../types/game';
import { StrategyDecision } from '../../types/strategy';
import { actionTypeToStrategyAction, strategyActionToActionType } from './converters/actionConverter';
import { getDealerDisplayValue, getDealerColumnIndex } from './converters/cardConverter';
import { getHardHandStrategyAction } from './evaluators/hardHandEvaluator';
import { getSoftHandStrategyAction } from './evaluators/softHandEvaluator';
import { getPairStrategyAction } from './evaluators/pairEvaluator';
import { getBestAlternativeAction } from './evaluators/alternativeActionFinder';
import { getHandType, getDecisionExplanation } from './explanations/decisionExplainer';

/**
 * Gets the optimal basic strategy action for a given game situation
 */
export function getOptimalAction(
    playerHand: PlayerHand,
    dealerUpCard: Card,
    availableActions: ActionType[]
): ActionType {
    const playerValue = playerHand.handValue;
    const dealerValue = getDealerDisplayValue(dealerUpCard);
    const dealerColumnIndex = getDealerColumnIndex(dealerValue);
    const isSoft = playerHand.isSoft;
    const isPair = playerHand.cards.length === 2 &&
        playerHand.cards[0].rank === playerHand.cards[1].rank;

    // Get strategy action from appropriate chart
    let strategyAction;

    if (isPair && availableActions.includes('SPLIT')) {
        strategyAction = getPairStrategyAction(playerHand.cards[0].rank, dealerColumnIndex);
    } else if (isSoft) {
        strategyAction = getSoftHandStrategyAction(playerValue, dealerColumnIndex);
    } else {
        strategyAction = getHardHandStrategyAction(playerValue, dealerColumnIndex);
    }

    // Convert strategy action to available action type
    const optimalAction = strategyActionToActionType(strategyAction);

    // If optimal action is not available, find best alternative
    if (!availableActions.includes(optimalAction)) {
        return getBestAlternativeAction(strategyAction, availableActions);
    }

    return optimalAction;
}

/**
 * Evaluates if a player's action matches optimal basic strategy
 */
export function evaluateDecision(
    playerAction: ActionType,
    playerHand: PlayerHand,
    dealerUpCard: Card,
    availableActions: ActionType[]
): StrategyDecision {
    const optimalAction = getOptimalAction(playerHand, dealerUpCard, availableActions);
    const isCorrect = playerAction === optimalAction;

    const dealerValue = getDealerDisplayValue(dealerUpCard);
    const strategyContext = {
        playerHandType: getHandType(playerHand),
        playerValue: playerHand.handValue,
        dealerValue,
        isSoft: playerHand.isSoft,
        isPair: playerHand.cards.length === 2 &&
            playerHand.cards[0].rank === playerHand.cards[1].rank
    };

    return {
        action: actionTypeToStrategyAction(playerAction),
        optimalAction: actionTypeToStrategyAction(optimalAction),
        isCorrect,
        explanation: getDecisionExplanation(playerAction, optimalAction, strategyContext),
        playerValue: playerHand.handValue,
        dealerUpcard: dealerValue,
        handType: getHandType(playerHand),
        timestamp: Date.now()
    };
}

// Re-export utilities for convenience
export { getStrategyCellCoordinates } from './coordinateCalculator';
export { getActionName } from './converters/actionConverter';
