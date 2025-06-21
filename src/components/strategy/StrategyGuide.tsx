// Enhanced StrategyGuide component with real-time highlighting and feedback
import React from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Stack,
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { HARD_TOTALS_CHART, SOFT_TOTALS_CHART, PAIRS_CHART, ACTION_DESCRIPTIONS } from '../../data/strategyCharts';
import { getStrategyCellCoordinates } from '../../utils/strategy';
import StrategyTable from './StrategyTable';
import StrategyFeedback from './StrategyFeedback';

const StrategyGuide: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  // Get current game state for highlighting
  const gameState = useAppSelector(state => state.game);
  const currentHand = gameState.playerHands[gameState.currentHandIndex];
  const dealerUpCard = gameState.dealerHand.cards[0];
  const lastAction = gameState.lastAction;

  // Calculate which cell to highlight
  const highlightCoordinates = React.useMemo(() => {
    if (!currentHand || !dealerUpCard || gameState.gamePhase !== 'PLAYER_TURN') {
      return null;
    }
    return getStrategyCellCoordinates(currentHand, dealerUpCard);
  }, [currentHand, dealerUpCard, gameState.gamePhase]);

  // Get the highlight for current tab
  const getCurrentHighlight = () => {
    if (!highlightCoordinates) return null;

    const tabToTable = ['HARD', 'SOFT', 'PAIRS'] as const;
    const currentTable = tabToTable[tabValue];

    if (highlightCoordinates.table === currentTable) {
      return {
        row: highlightCoordinates.row,
        col: highlightCoordinates.col
      };
    }
    return null;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Convert action log to strategy decision for feedback
  const getLastStrategyDecision = () => {
    if (!lastAction) return null;

    return {
      action: lastAction.action === 'HIT' ? 'H' as const :
        lastAction.action === 'STAND' ? 'S' as const :
          lastAction.action === 'DOUBLE' ? 'D' as const :
            lastAction.action === 'SPLIT' ? 'P' as const : 'R' as const,
      optimalAction: lastAction.optimalAction === 'HIT' ? 'H' as const :
        lastAction.optimalAction === 'STAND' ? 'S' as const :
          lastAction.optimalAction === 'DOUBLE' ? 'D' as const :
            lastAction.optimalAction === 'SPLIT' ? 'P' as const : 'R' as const,
      isCorrect: lastAction.wasCorrect,
      explanation: lastAction.wasCorrect
        ? `Correct! ${lastAction.action} is the optimal strategy.`
        : `Incorrect. ${lastAction.optimalAction} would be optimal.`,
      playerValue: lastAction.handValueAfter,
      dealerUpcard: dealerUpCard ? (dealerUpCard.rank === 'A' ? 1 :
        ['J', 'Q', 'K'].includes(dealerUpCard.rank) ? 10 :
          parseInt(dealerUpCard.rank)) : 0,
      handType: currentHand?.isSoft ? 'SOFT' as const :
        currentHand?.cards.length === 2 && currentHand.cards[0].rank === currentHand.cards[1].rank ? 'PAIR' as const : 'HARD' as const,
      timestamp: lastAction.timestamp
    };
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Basic Strategy Guide
      </Typography>

      {/* Strategy Feedback */}
      <StrategyFeedback
        decision={getLastStrategyDecision()}
        isVisible={gameState.gamePhase === 'PLAYER_TURN' || gameState.gamePhase === 'DEALER_TURN'}
      />

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Hard Totals" />
        <Tab label="Soft Totals" />
        <Tab label="Pairs" />
      </Tabs>

      {/* Action Legend */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Action Legend
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {Object.entries(ACTION_DESCRIPTIONS).map(([action, desc]) => (
            <Box key={action} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: desc.color,
                  borderRadius: 1,
                  mr: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                }}
              >
                {action}
              </Box>
              <Typography variant="body2">
                {desc.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Strategy Tables */}
      {tabValue === 0 && (
        <StrategyTable
          chart={HARD_TOTALS_CHART}
          highlightCell={getCurrentHighlight()}
        />
      )}
      {tabValue === 1 && (
        <StrategyTable
          chart={SOFT_TOTALS_CHART}
          highlightCell={getCurrentHighlight()}
        />
      )}
      {tabValue === 2 && (
        <StrategyTable
          chart={PAIRS_CHART}
          highlightCell={getCurrentHighlight()}
        />
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {gameState.gamePhase === 'PLAYER_TURN' && currentHand
          ? 'Yellow highlighting shows the current situation'
          : 'Make a decision to see strategy feedback'
        }
      </Typography>
    </Box>
  );
};

export default StrategyGuide;
