import React, { useState, useEffect } from 'react';
import CardComponent from '../Card/Card';
import { Card as CardType, PlayerHand as PlayerHandType, ActionLogEntry } from '../../logic/blackjackTypes';
import { Box, Typography, Paper, Fade } from '@mui/material';

interface GameAreaProps {
  dealerHand: CardType[];
  playerHands: PlayerHandType[];
  currentHandIndex: number;
  hideDealerFirstCard: boolean;
  getHandScoreText: (handCards: CardType[]) => string;
  gameActive: boolean;
  message: string;
  recentAction?: ActionLogEntry;
}

const GameArea: React.FC<GameAreaProps> = ({ 
  dealerHand, 
  playerHands, 
  currentHandIndex, 
  hideDealerFirstCard, 
  getHandScoreText,
  gameActive,
  message,
  recentAction
}) => {
  // State for visual feedback effects
  const [playerFlash, setPlayerFlash] = useState<'correct' | 'mistake' | null>(null);
  const [activeArea, setActiveArea] = useState<'player' | 'dealer' | null>(null);
  const [winnerArea, setWinnerArea] = useState<'player' | 'dealer' | 'push' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Effect to determine active play area
  useEffect(() => {
    if (!gameActive) {
      setActiveArea(null);
      return;
    }

    if (hideDealerFirstCard) {
      setActiveArea('player');
    } else {
      setActiveArea('dealer');
    }
  }, [gameActive, hideDealerFirstCard]);

  // Effect to show feedback on player decisions
  useEffect(() => {
    if (recentAction) {
      setPlayerFlash(recentAction.wasCorrect ? 'correct' : 'mistake');
      
      // Reset flash after a short delay
      const timer = setTimeout(() => {
        setPlayerFlash(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [recentAction]);

  // Effect to display outcome at end of hand
  useEffect(() => {
    if (!gameActive && playerHands.length > 0) {
      const currentHand = playerHands[currentHandIndex];
      
      if (currentHand) {
        if (currentHand.outcome === 'Win') {
          setWinnerArea('player');
          setStatusMessage('Player wins!');
        } else if (currentHand.outcome === 'Loss') {
          setWinnerArea('dealer');
          setStatusMessage('Dealer wins!');
        } else if (currentHand.outcome === 'Push') {
          setWinnerArea('push');
          setStatusMessage('Push!');
        }
      }
    } else {
      setWinnerArea(null);
      setStatusMessage(null);
    }
  }, [gameActive, playerHands, currentHandIndex]);

  // Message parsing for status display
  useEffect(() => {
    if (message && !statusMessage) {
      // Show strategic advice or important game messages
      if (message.includes('Correct:') || message.includes('Mistake!')) {
        setStatusMessage(message);
        const timer = setTimeout(() => {
          setStatusMessage(null);
        }, 3000);
        return () => clearTimeout(timer);
      }
      
      if (message.includes('Blackjack')) {
        setStatusMessage(message);
      }
    }
  }, [message, statusMessage]);

  const renderCards = (hand: CardType[], hidden: boolean = false) => (
    <Box sx={{ display: 'flex', gap: 1, my: 1 }} aria-live="polite">
      {hand.map((card, idx) => (
        <CardComponent key={card.id || idx} card={card} hidden={hidden && idx === 0} />
      ))}
    </Box>
  );
  
  const renderHandArea = (
    title: string, 
    hand: CardType[] | null, 
    score: string | null, 
    hidden: boolean = false, 
    isPlayer: boolean = false, 
    handIndex: number | null = null, 
    totalHands: number | null = null
  ) => {
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
      >
        <Typography variant="h6">
          {title}
          {isPlayer && totalHands != null && totalHands > 1 && handIndex != null && 
            ` (Hand ${handIndex + 1}/${totalHands})`
          }
        </Typography>
        
        {hand && hand.length > 0 ? renderCards(hand, hidden) :
          <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} />
        }
        
        <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
          {score !== null ? `Score: ${score}` : ''}
        </Typography>
      </Paper>
    );
  };

  const currentPlayerHand: PlayerHandType | null = (playerHands && playerHands.length > 0 && currentHandIndex < playerHands.length)
    ? playerHands[currentHandIndex]
    : null;

  const dealerScore = (hideDealerFirstCard && dealerHand.length > 0) ? '?' : (dealerHand.length > 0 ? getHandScoreText(dealerHand) : null);

  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, justifyContent: 'center', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {renderHandArea('Dealer', dealerHand && dealerHand.length > 0 ? dealerHand : null, dealerScore, hideDealerFirstCard)}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {renderHandArea('Player', currentPlayerHand ? currentPlayerHand.cards : null, currentPlayerHand ? getHandScoreText(currentPlayerHand.cards) : null, false, true, currentHandIndex, playerHands.length)}
        </Box>
      </Box>
      
      {/* Status message display */}
      {statusMessage && (
        <Fade in={!!statusMessage}>
          <Box 
            sx={{ 
              width: '100%', 
              textAlign: 'center', 
              mt: 1,
              p: 1,
              fontWeight: 'bold',
              color: 'text.primary'
            }}
          >
            <Typography variant="body1">{statusMessage}</Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default GameArea;
