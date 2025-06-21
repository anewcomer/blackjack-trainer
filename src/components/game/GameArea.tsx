// Game area component - Phase 2 implementation with basic game flow
import React from 'react';
import { Typography, Box, Button, Stack, Card, CardContent, Divider } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { startNewHand, playerAction } from '../../store/gameThunks';
import { formatHandValue } from '../../utils/cardUtils';

const GameArea: React.FC = () => {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state) => state.game);

  const handleNewHand = () => {
    dispatch(startNewHand());
  };

  const handlePlayerAction = (action: 'HIT' | 'STAND' | 'DOUBLE' | 'SURRENDER') => {
    dispatch(playerAction(action));
  };

  const currentPlayerHand = gameState.playerHands[gameState.currentHandIndex];
  const canPlay = gameState.gamePhase === 'PLAYER_TURN' && currentPlayerHand && !currentPlayerHand.busted && !currentPlayerHand.stood;

  return (
    <Box sx={{ color: 'white', height: '100%', p: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Blackjack Trainer
      </Typography>

      {/* New Hand Button */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleNewHand}
          sx={{ minWidth: 150 }}
        >
          Deal New Hand
        </Button>
      </Box>

      {/* Game State Display */}
      <Stack spacing={3}>
        {/* Dealer Area */}
        <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dealer
            </Typography>
            {gameState.dealerHand.cards.length > 0 ? (
              <>
                <Typography variant="body1">
                  Cards: {gameState.dealerHand.cards.map((card, index) =>
                    gameState.dealerHand.hideHoleCard && index === 1
                      ? '[Hidden]'
                      : `${card.rank}${card.suit}`
                  ).join(', ')}
                </Typography>
                <Typography variant="body1">
                  Value: {gameState.dealerHand.hideHoleCard && gameState.dealerHand.cards.length > 1
                    ? `${gameState.dealerHand.cards[0].rank}${gameState.dealerHand.cards[0].suit} + [Hidden]`
                    : formatHandValue(gameState.dealerHand.cards)
                  }
                </Typography>
              </>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                No cards dealt
              </Typography>
            )}
          </CardContent>
        </Card>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />

        {/* Player Area */}
        <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Player {gameState.playerHands.length > 1 ? `(Hand ${gameState.currentHandIndex + 1})` : ''}
            </Typography>
            {currentPlayerHand ? (
              <>
                <Typography variant="body1">
                  Cards: {currentPlayerHand.cards.map(card => `${card.rank}${card.suit}`).join(', ')}
                </Typography>
                <Typography variant="body1">
                  Value: {formatHandValue(currentPlayerHand.cards)}
                </Typography>
                {currentPlayerHand.busted && (
                  <Typography variant="body1" color="error">
                    BUST!
                  </Typography>
                )}
                {currentPlayerHand.isBlackjack && (
                  <Typography variant="body1" color="success.main">
                    BLACKJACK!
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                No cards dealt
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Stack spacing={2} direction="row" justifyContent="center">
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={() => handlePlayerAction('HIT')}
            disabled={!canPlay}
          >
            Hit
          </Button>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() => handlePlayerAction('STAND')}
            disabled={!canPlay}
          >
            Stand
          </Button>
          <Button
            variant="contained"
            color="info"
            size="large"
            onClick={() => handlePlayerAction('DOUBLE')}
            disabled={!canPlay || currentPlayerHand?.cards.length !== 2}
          >
            Double
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="large"
            onClick={() => handlePlayerAction('SURRENDER')}
            disabled={!canPlay || currentPlayerHand?.cards.length !== 2}
          >
            Surrender
          </Button>
        </Stack>

        {/* Game Status */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Game Phase: {gameState.gamePhase}
          </Typography>

          {/* Show game results when game is over */}
          {gameState.gamePhase === 'GAME_OVER' && gameState.gameResult && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Game Results
              </Typography>
              <Stack direction="row" spacing={3} justifyContent="center">
                <Typography variant="body2" color="success.main">
                  Wins: {gameState.gameResult.wins}
                </Typography>
                <Typography variant="body2" color="error.main">
                  Losses: {gameState.gameResult.losses}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  Pushes: {gameState.gameResult.pushes}
                </Typography>
                {gameState.gameResult.surrenders > 0 && (
                  <Typography variant="body2" color="info.main">
                    Surrenders: {gameState.gameResult.surrenders}
                  </Typography>
                )}
                {gameState.gameResult.blackjacks > 0 && (
                  <Typography variant="body2" color="success.main">
                    Blackjacks: {gameState.gameResult.blackjacks}
                  </Typography>
                )}
              </Stack>
              <Button
                variant="contained"
                onClick={handleNewHand}
                sx={{ mt: 2 }}
              >
                New Hand
              </Button>
            </Box>
          )}

          {/* Show dealer turn indicator */}
          {gameState.gamePhase === 'DEALER_TURN' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="info.main">
                Dealer is playing...
              </Typography>
            </Box>
          )}

          {gameState.availableActions.length > 0 && gameState.gamePhase === 'PLAYER_TURN' && (
            <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>
              Available Actions: {gameState.availableActions.join(', ')}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default GameArea;
