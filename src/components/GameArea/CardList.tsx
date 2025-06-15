import React from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CardComponent from '../Card/Card';
import { Card as CardType } from '../../logic/game/cardTypes';

interface CardListProps {
  hand: CardType[];
  hiddenFirstCard?: boolean;
  newCardIds?: string[];
  isPlayer?: boolean;
}

/**
 * Component for rendering a list of cards with animations
 */
const CardList: React.FC<CardListProps> = ({
  hand,
  hiddenFirstCard = false,
  newCardIds = [],
  isPlayer = false
}) => {
  return (
    <Box 
      component={motion.div}
      layout
      sx={{ 
        display: 'flex', 
        gap: 1, 
        my: 1, 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }} 
      aria-live="polite"
      role="group"
      aria-label={`Cards in hand, ${hand.length} total`}
    >
      <AnimatePresence>
        {hand.map((card, idx) => (
          <CardComponent 
            key={card.id || idx} 
            card={card} 
            hidden={hiddenFirstCard && idx === 0} 
            index={idx}
            isNew={newCardIds.includes(card.id)}
          />
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default React.memo(CardList);
