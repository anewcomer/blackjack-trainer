import React from 'react';
import { Box, Typography } from '@mui/material';

// We can use the Card type from useBlackjackGame if it's exported and suitable,
// or define a local one specific to this component's needs.
// For now, a local definition:
interface CardData {
  rank: string;
  suit: string;
}
interface CardProps {
  card?: CardData; // Card can be undefined for an empty slot
  hidden?: boolean;
}
const CardComponent: React.FC<CardProps> = ({ card, hidden }) => {
  if (!card) {
    return <Box sx={{ width: 40, height: 60, border: '1px dashed grey', borderRadius: 1, display: 'inline-block', m: 0.5, bgcolor: 'background.paper', opacity: 0.5 }} />;
  }
  if (hidden) {
    return <Box sx={{ width: 40, height: 60, border: '2px solid', borderColor: 'grey.700', borderRadius: 1, display: 'inline-block', m: 0.5, bgcolor: 'grey.400' }} aria-label="Hidden card" />;
  }
  const isRed = card.suit === '\u2665' || card.suit === '\u2666';
  return (
    <Box sx={{ width: 40, height: 60, border: '2px solid', borderColor: isRed ? 'error.main' : 'grey.700', borderRadius: 1, display: 'inline-block', m: 0.5, bgcolor: 'background.paper', color: isRed ? 'error.main' : 'text.primary', position: 'relative', boxShadow: 2 }} aria-label={`${card.rank} of ${card.suit}`}>
      <Typography variant="body2" sx={{ position: 'absolute', top: 4, left: 6, fontWeight: 'bold' }}>{card.rank}</Typography>
      <Typography variant="body2" sx={{ position: 'absolute', bottom: 4, right: 6 }}>{card.suit}</Typography>
    </Box>
  );
};

export default CardComponent;
