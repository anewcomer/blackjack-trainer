import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Card as CardType } from '../../logic/game/cardTypes';
import CardList from './CardList';

interface HandAreaProps {
  title: string;
  hand: CardType[] | null;
  score: string | null;
  hiddenFirstCard?: boolean;
  isPlayer?: boolean;
  handIndex?: number | null;
  totalHands?: number | null;
  activeArea: 'player' | 'dealer' | null;
  winnerArea: 'player' | 'dealer' | 'push' | null;
  playerFlash: 'correct' | 'mistake' | null;
  newCardIds: string[];
}

/**
 * Component for rendering a hand area (dealer or player) with cards and feedback
 */
const HandArea: React.FC<HandAreaProps> = ({
  title,
  hand,
  score,
  hiddenFirstCard = false,
  isPlayer = false,
  handIndex = null,
  totalHands = null,
  activeArea,
  winnerArea,
  playerFlash,
  newCardIds
}) => {
  // Determine visual feedback styling based on state
  let bgColor = isPlayer ? 'primary.lighter' : 'background.paper';
  let borderColor = 'transparent';
  let elevation = 2;
  
  // Active area highlighting
  if (activeArea === 'player' && isPlayer) {
    borderColor = 'primary.main';
    elevation = 4;
  } else if (activeArea === 'dealer' && !isPlayer) {
    borderColor = 'info.main';
    elevation = 4;
  }
  
  // Winner highlighting
  if (winnerArea === 'player' && isPlayer) {
    borderColor = 'success.main';
    bgColor = 'success.lighter';
    elevation = 4;
  } else if (winnerArea === 'dealer' && !isPlayer) {
    borderColor = 'error.main';
    bgColor = 'error.lighter';
    elevation = 4;
  } else if (winnerArea === 'push') {
    borderColor = 'warning.main';
  }
  
  // Decision feedback flash
  if (playerFlash && isPlayer) {
    if (playerFlash === 'correct') {
      bgColor = 'success.lighter';
      borderColor = 'success.main';
    } else if (playerFlash === 'mistake') {
      bgColor = 'error.lighter';
      borderColor = 'error.main';
    }
  }

  // Create descriptive title for accessibility
  const areaLabel = isPlayer ? 
    `Player's hand${totalHands && totalHands > 1 ? `, hand ${handIndex! + 1} of ${totalHands}` : ''}` : 
    'Dealer\'s hand';
  
  // Create dynamic status description based on game state
  let statusDescription = '';
  if (isPlayer && playerFlash === 'correct') statusDescription = 'Correct move';
  if (isPlayer && playerFlash === 'mistake') statusDescription = 'Incorrect move';
  if (isPlayer && activeArea === 'player') statusDescription = 'Your turn to play';
  if (!isPlayer && activeArea === 'dealer') statusDescription = 'Dealer is playing';
  if (isPlayer && winnerArea === 'player') statusDescription = 'You won';
  if (!isPlayer && winnerArea === 'dealer') statusDescription = 'Dealer won';
  if (winnerArea === 'push') statusDescription = 'Push, it\'s a tie';

  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: 2, 
        mb: 2, 
        minHeight: 140, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        bgcolor: bgColor,
        border: 2,
        borderColor: borderColor,
        transition: 'all 0.3s ease',
        animation: (
          (activeArea === 'player' && isPlayer) || 
          (activeArea === 'dealer' && !isPlayer)
        ) ? 'pulse 1.5s infinite' : 'none',
        '@keyframes pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' }
        }
      }}
      role="region"
      aria-label={areaLabel}
      aria-live={activeArea === (isPlayer ? 'player' : 'dealer') ? 'polite' : 'off'}
    >
      <Typography variant="h6">
        {title}
        {isPlayer && totalHands != null && totalHands > 1 && handIndex != null && 
          ` (Hand ${handIndex + 1}/${totalHands})`
        }
      </Typography>
      
      {hand && hand.length > 0 ? (
        <CardList 
          hand={hand}
          hiddenFirstCard={hiddenFirstCard}
          newCardIds={newCardIds}
          isPlayer={isPlayer}
        />
      ) : (
        <Box 
          sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
          aria-label="No cards dealt yet"
        />
      )}
      
      <Typography 
        variant="body1" 
        sx={{ mt: 1, fontWeight: 'medium' }}
        aria-live="polite"
      >
        {score !== null ? `Score: ${score}` : ''}
      </Typography>

      {/* Hidden text for screen readers describing the current state */}
      {statusDescription && (
        <span className="visually-hidden" aria-live="polite" style={{ position: 'absolute', height: '1px', width: '1px', overflow: 'hidden' }}>
          {statusDescription}
        </span>
      )}
    </Paper>
  );
};

export default React.memo(HandArea);
