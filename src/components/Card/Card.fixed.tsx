import React, { useEffect, useState } from 'react';
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
  // Track previous hidden state to detect when a card flips over
  const [wasHidden, setWasHidden] = useState(hidden);
  const [shouldFlip, setShouldFlip] = useState(false);

  // Effect to detect when a card changes from hidden to visible
  useEffect(() => {
    if (wasHidden === true && hidden === false) {
      // Card is being flipped from face down to face up
      setShouldFlip(true);
      // Reset flip state after animation completes
      const timer = setTimeout(() => {
        setShouldFlip(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setWasHidden(hidden);
  }, [hidden, wasHidden]);

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
    // Face down card state
    faceDown: {
      y: 0,
      opacity: 1,
      rotateY: 180,
      scale: 1,
      transition: { 
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
        duration: 0.4
      }
    },
    // Flip animation for revealing cards (face down to face up)
    flip: {
      y: 0,
      opacity: 1,
      rotateY: [180, 0],
      scale: [1, 1.05, 1],
      transition: { 
        duration: 0.6,
        ease: "easeInOut" as const,
        times: [0, 0.5, 1]
      }
    },
    // New card being added to hand
    newCard: {
      scale: [0.8, 1.1, 1],
      opacity: [0, 1],
      y: [-50, 0],
      rotateY: [15, 0],
      transition: { 
        duration: 0.6,
        ease: "easeOut" as const,
        times: [0, 0.7, 1]
      }
    }
  };

  // Determine which animation to use
  let animationVariant = 'visible';
  if (isNew) {
    animationVariant = 'newCard';
  } else if (shouldFlip) {
    animationVariant = 'flip';
  } else if (hidden) {
    animationVariant = 'faceDown';
  }
  
  // For empty card slot
  if (!card) {
    const MotionDiv = motion.div;
    return (
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
        style={{ 
          width: 80, 
          height: 120, 
          border: '1px dashed grey', 
          borderRadius: 8, 
          display: 'inline-block', 
          margin: 5, 
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
          width: 80, 
          height: 120, 
          border: '3px solid #2c3e50',
          borderRadius: 8, 
          display: 'inline-block', 
          margin: 5, 
          background: `
            linear-gradient(45deg, #34495e 25%, transparent 25%), 
            linear-gradient(-45deg, #34495e 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #34495e 75%), 
            linear-gradient(-45deg, transparent 75%, #34495e 75%)`,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#2c3e50',
          position: 'relative',
          overflow: 'hidden',
          perspective: 1000
        }} 
        role="img"
        aria-label="Face down card"
      >
        {/* Decorative pattern overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '48px',
          height: '48px',
          border: '3px solid #5d6d7e',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #5d6d7e 30%, transparent 30%)',
          opacity: 0.7
        }} />
        {/* Corner decorations */}
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          width: '12px',
          height: '12px',
          background: '#5d6d7e',
          borderRadius: '50%',
          opacity: 0.6
        }} />
        <div style={{
          position: 'absolute',
          bottom: '4px',
          right: '4px',
          width: '12px',
          height: '12px',
          background: '#5d6d7e',
          borderRadius: '50%',
          opacity: 0.6
        }} />
      </MotionDiv>
    );
  }

  // For face up card
  const isRed = card.suit === '\u2665' || card.suit === '\u2666';
  const suitName = getSuitName(card.suit);
  const rankName = getRankName(card.rank);
  
  const MotionDiv = motion.div;
  
  return (
    <MotionDiv
      initial={wasHidden ? "faceDown" : "hidden"}
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
        width: 80, 
        height: 120, 
        border: '3px solid', 
        borderColor: isRed ? '#d32f2f' : '#424242', 
        borderRadius: 8, 
        display: 'inline-block', 
        margin: 5, 
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        color: isRed ? '#d32f2f' : '#212121', 
        position: 'relative', 
        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15), inset 0px 2px 0px rgba(255, 255, 255, 0.8)',
        perspective: 1000,
        overflow: 'hidden'
      }} 
      role="img"
      aria-label={`${rankName} of ${suitName}`}
    >
      {/* Subtle inner border for card elegance */}
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        right: '5px',
        bottom: '5px',
        border: '2px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '5px',
        pointerEvents: 'none'
      }} />
      
      {/* Top left rank and suit */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: '16px'
      }}>
        <span>{card.rank}</span>
        <span style={{ fontSize: '12px' }}>{card.suit}</span>
      </div>
      
      {/* Center suit symbol */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '28px',
        opacity: 0.7
      }}>
        {card.suit}
      </div>
      
      {/* Bottom right rank and suit (rotated) */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: '16px',
        transform: 'rotate(180deg)'
      }}>
        <span>{card.rank}</span>
        <span style={{ fontSize: '12px' }}>{card.suit}</span>
      </div>
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
