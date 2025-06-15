import React from 'react';
import { Typography } from '@mui/material';
import { Card } from '../../logic/game/cardTypes';
import { motion } from 'framer-motion';

interface CardProps {
  card?: Card; // Card can be undefined for an empty slot
  hidden?: boolean;
  index?: number; // For staggered animation timing
  isNew?: boolean; // Indicates if this is a newly dealt card
}

/**
 * Card component that renders a playing card with full accessibility support and animations
 */
const CardComponent: React.FC<CardProps> = ({ card, hidden, index = 0, isNew = false }) => {
  // Animation variants for card entrance and flips
  const cardVariants = {
    // Initial hidden state (off-screen and rotated)
    hidden: { 
      y: -100, 
      opacity: 0, 
      rotateY: 180,
      scale: 0.8
    },
    // Final visible state with explicit typing for Framer Motion
    visible: (i: number) => ({ 
      y: 0, 
      opacity: 1, 
      rotateY: 0,
      scale: 1,
      transition: { 
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
        delay: i * 0.1, // Stagger based on index
        duration: 0.3
      }
    }),
    // Flip animation for revealing cards
    flip: {
      rotateY: [180, 0],
      transition: { duration: 0.5 }
    },
    // New card being added to hand
    newCard: {
      scale: [0.8, 1.1, 1],
      opacity: [0, 1],
      y: [-50, 0],
      transition: { 
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  // Determine which animation to use
  const animationVariant = isNew ? 'newCard' : 'visible';
  
  // For empty card slot
  if (!card) {
    const MotionDiv = motion.div;
    return (
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
        style={{ 
          width: 40, 
          height: 60, 
          border: '1px dashed grey', 
          borderRadius: 4, 
          display: 'inline-block', 
          margin: 4, 
          backgroundColor: 'transparent', 
        }}
        role="presentation" 
        aria-hidden="true"
      />
    );
  }

  // For hidden card (face down)
  if (hidden) {
    const MotionDiv = motion.div;
    return (
      <MotionDiv
        initial="hidden"
        animate={animationVariant}
        custom={index}
        variants={cardVariants}
        style={{ 
          width: 40, 
          height: 60, 
          border: '2px solid',
          borderColor: '#424242', 
          borderRadius: 4, 
          display: 'inline-block', 
          margin: 4, 
          backgroundColor: '#bdbdbd',
          perspective: 1000
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
  
  const MotionDiv = motion.div;
  
  return (
    <MotionDiv
      initial="hidden"
      animate={animationVariant}
      custom={index}
      variants={cardVariants}
      whileHover={{ 
        y: -5, 
        scale: 1.05,
        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
        transition: { duration: 0.2 }
      }}
      style={{ 
        width: 40, 
        height: 60, 
        border: '2px solid', 
        borderColor: isRed ? '#d32f2f' : '#424242', 
        borderRadius: 4, 
        display: 'inline-block', 
        margin: 4, 
        backgroundColor: '#fff', 
        color: isRed ? '#d32f2f' : '#212121', 
        position: 'relative', 
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
        perspective: 1000
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
    </MotionDiv>
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

// Use React.memo to prevent unnecessary re-renders of card components
export default React.memo(CardComponent, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  // Only re-render if important props have changed
  
  // Different cards or one is undefined and the other isn't
  if ((!prevProps.card && nextProps.card) || (prevProps.card && !nextProps.card)) {
    return false;
  }
  
  // Compare card properties if both exist
  if (prevProps.card && nextProps.card) {
    if (prevProps.card.id !== nextProps.card.id ||
        prevProps.card.rank !== nextProps.card.rank ||
        prevProps.card.suit !== nextProps.card.suit) {
      return false;
    }
  }
  
  // Check if hidden state changed
  if (prevProps.hidden !== nextProps.hidden) {
    return false;
  }
  
  // Check if animation state changed
  if (prevProps.isNew !== nextProps.isNew) {
    return false;
  }
  
  // No significant changes, don't re-render
  return true;
});
