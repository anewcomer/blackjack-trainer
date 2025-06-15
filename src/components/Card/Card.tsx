import React from 'react';
import { Box, Typography } from '@mui/material';
import { Card } from '../../logic/game/cardTypes';

interface CardProps {
  card?: Card; // Card can be undefined for an empty slot
  hidden?: boolean;
}

/**
 * Card component that renders a playing card with full accessibility support
 */
const CardComponent: React.FC<CardProps> = ({ card, hidden }) => {
  // For empty card slot
  if (!card) {
    return (
      <Box 
        sx={{ 
          width: 40, 
          height: 60, 
          border: '1px dashed grey', 
          borderRadius: 1, 
          display: 'inline-block', 
          m: 0.5, 
          bgcolor: 'background.paper', 
          opacity: 0.5 
        }}
        role="presentation" 
        aria-hidden="true"
      />
    );
  }

  // For hidden card (face down)
  if (hidden) {
    return (
      <Box 
        sx={{ 
          width: 40, 
          height: 60, 
          border: '2px solid', 
          borderColor: 'grey.700', 
          borderRadius: 1, 
          display: 'inline-block', 
          m: 0.5, 
          bgcolor: 'grey.400' 
        }} 
        role="img"
        aria-label="Face down card"
      />
    );
  }

  // For face up card
  const isRed = card.suit === '\u2665' || card.suit === '\u2666';
  const suitName = getSuitName(card.suit);
  const rankName = getRankName(card.rank);
  
  return (
    <Box 
      sx={{ 
        width: 40, 
        height: 60, 
        border: '2px solid', 
        borderColor: isRed ? 'error.main' : 'grey.700', 
        borderRadius: 1, 
        display: 'inline-block', 
        m: 0.5, 
        bgcolor: 'background.paper', 
        color: isRed ? 'error.main' : 'text.primary', 
        position: 'relative', 
        boxShadow: 2 
      }} 
      role="img"
      aria-label={`${rankName} of ${suitName}`}
    >
      <Typography variant="body2" sx={{ position: 'absolute', top: 4, left: 6, fontWeight: 'bold' }}>
        {card.rank}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ position: 'absolute', bottom: 4, right: 6 }}
        aria-hidden="true"
      >
        {card.suit}
      </Typography>
    </Box>
  );
};

/**
 * Helper function to get the full suit name from the symbol
 */
function getSuitName(suitSymbol: string): string {
  switch (suitSymbol) {
    case '♠': return 'Spades';
    case '♥': return 'Hearts';
    case '♦': return 'Diamonds';
    case '♣': return 'Clubs';
    default: return 'Unknown Suit';
  }
}

/**
 * Helper function to get the full rank name for screen readers
 */
function getRankName(rank: string): string {
  switch (rank) {
    case 'A': return 'Ace';
    case 'K': return 'King';
    case 'Q': return 'Queen';
    case 'J': return 'Jack';
    case '10': return 'Ten';
    case '9': return 'Nine';
    case '8': return 'Eight';
    case '7': return 'Seven';
    case '6': return 'Six';
    case '5': return 'Five';
    case '4': return 'Four';
    case '3': return 'Three';
    case '2': return 'Two';
    default: return rank;
  }
}

export default CardComponent;
