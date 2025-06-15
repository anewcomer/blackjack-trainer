import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography
} from '@mui/material';
import { GameHistoryEntry } from '../../logic/game/historyTypes';
import { 
  formatActionsLogForDisplay, 
  formatCardsForDisplay, 
  getEntryDescription 
} from './HistoryUtils';

interface GameHistoryTableProps {
  history: GameHistoryEntry[];
}

/**
 * Component for displaying game history in a table
 */
const GameHistoryTable: React.FC<GameHistoryTableProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }} role="status">
        <Typography variant="body1">No game history yet. Play a few hands to see them here!</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table size="small" aria-label="Game history table">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Player Cards</TableCell>
            <TableCell>Player Actions</TableCell>
            <TableCell>Dealer Cards</TableCell>
            <TableCell>Outcome</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map((entry, idx) => (
            entry.playerHands.map((ph, phIdx) => (
              <TableRow 
                key={`${entry.id}-${phIdx}`}
                hover
                aria-label={getEntryDescription(entry, idx)}
              >
                <TableCell>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                  {phIdx === 0 && <Typography variant="caption" display="block">{new Date(entry.timestamp).toLocaleDateString()}</Typography>}
                </TableCell>
                <TableCell>
                  <Box sx={{ fontFamily: 'monospace' }}>
                    <div><strong>Initial:</strong> {formatCardsForDisplay(ph.initialCards)}</div>
                    <div><strong>Final:</strong> {formatCardsForDisplay(ph.finalCards)}</div>
                    <div><strong>Value:</strong> {ph.finalScore}{ph.busted ? ' (BUST)' : ''}{ph.isBlackjack ? ' (BLACKJACK)' : ''}</div>
                  </Box>
                </TableCell>
                <TableCell>{formatActionsLogForDisplay(ph.actions)}</TableCell>
                <TableCell>
                  <Box sx={{ fontFamily: 'monospace' }}>
                    <div><strong>Up Card:</strong> {formatCardsForDisplay(entry.dealerUpCard)}</div>
                    <div><strong>Final:</strong> {formatCardsForDisplay(entry.dealerFinalCards)}</div>
                    <div><strong>Value:</strong> {entry.dealerFinalScore}</div>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ 
                    display: 'inline-block', 
                    fontWeight: 'bold',
                    color: ph.outcome === 'Win' ? '#388e3c' : ph.outcome === 'Loss' ? '#d32f2f' : '#ff9800',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: ph.outcome === 'Win' ? 'rgba(76, 175, 80, 0.1)' : ph.outcome === 'Loss' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                  }}>
                    {ph.outcome}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(GameHistoryTable);
