import React from 'react';
import CardComponent from '../Card/Card';
import { Card as CardType, PlayerHand as PlayerHandType } from '../../logic/types';
import { Box, Typography, Paper } from '@mui/material';

interface GameAreaProps {
  dealerHand: CardType[];
  playerHands: PlayerHandType[];
  currentHandIndex: number;
  hideDealerFirstCard: boolean;
  getHandScoreText: (handCards: CardType[]) => string;
}

const GameArea: React.FC<GameAreaProps> = ({ dealerHand, playerHands, currentHandIndex, hideDealerFirstCard, getHandScoreText }) => {
  const renderCards = (hand: CardType[], hidden: boolean = false) => (
    <Box sx={{ display: 'flex', gap: 1, my: 1 }} aria-live="polite">
      {hand.map((card, idx) => (
        <CardComponent key={card.id || idx} card={card} hidden={hidden && idx === 0} />
      ))}
    </Box>
  );
  const renderHandArea = (title: string, hand: CardType[] | null, score: string | null, hidden: boolean = false, isPlayer: boolean = false, handIndex: number | null = null, totalHands: number | null = null) => (
    <Paper elevation={2} sx={{ p: 2, mb: 2, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', bgcolor: isPlayer ? 'primary.lighter' : 'background.paper' }}>
      <Typography variant="h6">{title}</Typography>
      {hand && hand.length > 0 ? renderCards(hand, hidden) :
        <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} />
      }
      <Typography variant="body2" sx={{ mt: 1 }}>
        {score !== null ? `Score: ${score}` : ''}
        {isPlayer && totalHands != null && totalHands > 1 && handIndex != null && ` (Hand ${handIndex + 1}/${totalHands})`}
      </Typography>
    </Paper>
  );

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
    </Box>
  );
};

export default GameArea;
