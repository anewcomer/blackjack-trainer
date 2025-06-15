import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useBlackjack } from '../../context/BlackjackContext';
import HandArea from './HandArea';
import StatusMessage from './StatusMessage';
import { useGameAreaEffects } from '../../hooks/useGameAreaEffects';

/**
 * GameArea component that renders the dealer and player cards
 * Enhanced with accessibility features and refactored into smaller components
 */
const GameArea: React.FC = () => {
  const {
    dealerHand,
    playerHands,
    currentHandIndex,
    hideDealerFirstCard,
    getHandScoreText
  } = useBlackjack();

  // Get all state and effects through our custom hook
  const {
    newDealerCards,
    newPlayerCards,
    playerFlash,
    activeArea,
    winnerArea,
    statusMessage
  } = useGameAreaEffects();

  const currentPlayerHand = (playerHands && playerHands.length > 0 && currentHandIndex < playerHands.length)
    ? playerHands[currentHandIndex]
    : null;

  const dealerScore = (hideDealerFirstCard && dealerHand.length > 0) ? 
    '?' : (dealerHand.length > 0 ? getHandScoreText(dealerHand) : null);
  
  return (
    <Box 
      sx={{ width: '100%', my: 2 }}
      role="main"
      aria-label="Blackjack game area"
    >
      <Box 
        component={motion.div}
        layout
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, // Responsive layout
          gap: 3, 
          justifyContent: 'center', 
          alignItems: 'flex-start' 
        }}
      >
        {/* Dealer area */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 }, maxWidth: { xs: '100%', sm: '50%' } }}>
          <HandArea
            title="Dealer"
            hand={dealerHand && dealerHand.length > 0 ? dealerHand : null}
            score={dealerScore}
            hiddenFirstCard={hideDealerFirstCard}
            isPlayer={false}
            activeArea={activeArea}
            winnerArea={winnerArea}
            playerFlash={playerFlash}
            newCardIds={newDealerCards}
          />
        </Box>

        {/* Player area */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 }, maxWidth: { xs: '100%', sm: '50%' } }}>
          <HandArea
            title="Player"
            hand={currentPlayerHand ? currentPlayerHand.cards : null}
            score={currentPlayerHand ? getHandScoreText(currentPlayerHand.cards) : null}
            isPlayer={true}
            handIndex={currentHandIndex}
            totalHands={playerHands.length}
            activeArea={activeArea}
            winnerArea={winnerArea}
            playerFlash={playerFlash}
            newCardIds={newPlayerCards}
          />
        </Box>
      </Box>
      
      {/* Status message display */}
      <StatusMessage message={statusMessage} />
    </Box>
  );
};

// Memoize the GameArea component to prevent unnecessary re-renders
export default React.memo(GameArea);
