import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { GameHistoryEntry, SessionStats, PlayerHandHistoryForModal } from '../../logic/types';
import ModalLink from './ModalLink';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameHistoryEntry[];
  stats: SessionStats;
  onNewSession: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, stats, onNewSession }) => {
  // Helper to format actions as a list
  const formatActionsLogForDisplay = (actionsLogArray: PlayerHandHistoryForModal['actions']) => {
    if (!actionsLogArray || actionsLogArray.length === 0) return <span>N/A</span>;
    return (
      <ul style={{ margin: 0, paddingLeft: '1.2em', textAlign: 'left' }}>
        {actionsLogArray.map((log, idx) => (
          <li key={idx} style={{ color: log.correct ? '#388e3c' : '#e65100' }}>
            {log.action} {log.cardDealt ? `(${log.cardDealt})` : ''} [Val: {log.valueBefore} → {log.valueAfter}] {log.correct ? '(Correct)' : `(Mistake! Optimal: ${log.optimal})`}
          </li>
        ))}
      </ul>
    );
  };

  // Helper to format dealer actions
  const formatDealerActionsForDisplay = (dealerActionsLogArray: GameHistoryEntry['dealerActions']) => {
    if (!dealerActionsLogArray || dealerActionsLogArray.length === 0) return <span>N/A</span>;
    return (
      <ul style={{ margin: 0, paddingLeft: 0, listStylePosition: 'inside', textAlign: 'left' }}>
        {dealerActionsLogArray.map((log, idx) => (
          <li key={idx}>
            {log.action} {log.cardDealt ? `(${log.cardDealt})` : ''} [Val: {log.valueBefore} → {log.valueAfter}]
          </li>
        ))}
      </ul>
    );
  };

  // Helper to format cards
  const formatCardsForDisplay = (cards: string) => cards || 'N/A';

  // Session stats as in the modal
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          Game History
          <ModalLink onClick={onNewSession} sx={{ ml: 2 }}>
            New Session
          </ModalLink>
        </span>
        <IconButton aria-label="close" onClick={onClose} sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper}>
          <Table id="history-table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Hand(s)</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Dealer</TableCell>
                <TableCell>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableRow><TableCell colSpan={5}>No game history yet. Start a new game!</TableCell></TableRow>
              ) : (
                history.slice().reverse().map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      {entry.playerHands.map((ph, idx) => (
                        <div key={idx}>
                          <strong>Hand {idx + 1}:</strong> {formatCardsForDisplay(ph.initialCards)} → {formatCardsForDisplay(ph.finalCards)} (Score: {ph.finalScore}{ph.busted ? ' BUST' : ''}{ph.surrendered ? ' SURRENDER' : ''}{ph.isBlackjack ? ' (Blackjack)' : ''})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {entry.playerHands.map((ph, idx) => (
                        <div key={idx}>{formatActionsLogForDisplay(ph.actions)}</div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div>Upcard: {entry.dealerUpCard}</div>
                      <div>Hole: {entry.dealerHoleCard}</div>
                      <div>Final: {entry.dealerFinalCards} (Score: {entry.dealerFinalScore}{entry.dealerBusted ? ' BUST' : ''}{entry.dealerBlackjackOnInit ? ' (Blackjack)' : ''})</div>
                      {formatDealerActionsForDisplay(entry.dealerActions)}
                    </TableCell>
                    <TableCell>
                      {entry.playerHands.map((ph, idx) => (
                        <div key={idx}>{ph.outcome}</div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        borderTop: '1px solid #eee',
        background: 'inherit', // inherit modal background
        fontSize: '0.98rem',
        flexWrap: 'wrap',
        gap: '2.5em',
        boxShadow: '0px 2px 8px 0px rgba(60,60,60,0.04)',
      }}>
        <span><span style={{ color: '#388e3c', fontWeight: 500 }}>Correct:</span> <strong>{stats.correctMoves}</strong> <span style={{ color: '#aaa' }}>({calculatePercentage(stats.correctMoves, stats.totalDecisions)})</span></span>
        <span><span style={{ color: '#d32f2f', fontWeight: 500 }}>Incorrect:</span> <strong>{stats.incorrectMoves}</strong> <span style={{ color: '#aaa' }}>({calculatePercentage(stats.incorrectMoves, stats.totalDecisions)})</span></span>
        <span><span style={{ fontWeight: 500 }}>Decisions:</span> <strong>{stats.totalDecisions}</strong></span>
        <span><span style={{ color: '#388e3c', fontWeight: 500 }}>Wins:</span> <strong>{stats.wins}</strong> <span style={{ color: '#aaa' }}>({calculatePercentage(stats.wins, stats.handsPlayed)})</span></span>
        <span><span style={{ color: '#d32f2f', fontWeight: 500 }}>Losses:</span> <strong>{stats.losses}</strong> <span style={{ color: '#aaa' }}>({calculatePercentage(stats.losses, stats.handsPlayed)})</span></span>
        <span><span style={{ color: '#1976d2', fontWeight: 500 }}>Pushes:</span> <strong>{stats.pushes}</strong> <span style={{ color: '#aaa' }}>({calculatePercentage(stats.pushes, stats.handsPlayed)})</span></span>
        <span><span style={{ fontWeight: 500 }}>Hands Played:</span> <strong>{stats.handsPlayed}</strong></span>
      </div>
    </Dialog>
  );
};

export default HistoryModal;
