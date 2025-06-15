import React, { useRef, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useBlackjack } from '../../context/BlackjackContext';
import { GameHistoryEntry, PlayerHandHistoryForModal } from '../../logic/game/historyTypes';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useFocusTrap from '../../hooks/useFocusTrap';

/**
 * HistoryModal component that displays the game history and session statistics
 * Enhanced with accessibility features and keyboard navigation
 */
const HistoryModal: React.FC = () => {
  const {
    showHistoryModal: isOpen,
    closeHistoryModalHandler: onClose,
    gameHistory: history,
    sessionStats: stats,
    resetSessionStats,
    newGameHandler
  } = useBlackjack();

  // Reference to the dialog content for focus trap
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Reference to focus on close button when modal opens
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Apply focus trap to dialog
  useFocusTrap(isOpen, dialogRef);

  // Focus the close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const onNewSession = () => {
    resetSessionStats();
    newGameHandler();
    onClose();
  };

  // Generate a descriptive title for the game history entry
  const getEntryDescription = (entry: GameHistoryEntry, index: number) => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    const time = new Date(entry.timestamp).toLocaleTimeString();
    const outcome = entry.playerHands[0]?.outcome || 'Unknown';
    return `Game ${index + 1} played on ${date} at ${time}, outcome: ${outcome}`;
  };

  // Helper to format actions as a list
  const formatActionsLogForDisplay = (actionsLogArray: PlayerHandHistoryForModal['actions']) => {
    if (!actionsLogArray || actionsLogArray.length === 0) return <span>N/A</span>;
    return (
      <ul 
        style={{ margin: 0, paddingLeft: '1.2em', textAlign: 'left' }}
        aria-label="Player actions"
      >
        {actionsLogArray.map((log, idx) => (
          <li 
            key={idx} 
            style={{ color: log.correct ? '#388e3c' : '#e65100' }}
            aria-label={`${log.action} ${log.cardDealt ? 'receiving ' + log.cardDealt : ''}, hand value from ${log.valueBefore} to ${log.valueAfter}, ${log.correct ? 'correct play' : 'mistake, optimal play was ' + log.optimal}`}
          >
            {log.action} {log.cardDealt ? `(${log.cardDealt})` : ''} [Val: {log.valueBefore} → {log.valueAfter}] {log.correct ? '(Correct)' : `(Mistake! Optimal: ${log.optimal})`}
          </li>
        ))}
      </ul>
    );
  };

  // Helper to format dealer actions
  const formatDealerActionsForDisplay = (dealerActionsLogArray: Array<{action: string; cardDealt?: string | null; valueBefore: number; valueAfter: number}>) => {
    if (!dealerActionsLogArray || dealerActionsLogArray.length === 0) return <span>N/A</span>;
    return (
      <ul 
        style={{ margin: 0, paddingLeft: 0, listStylePosition: 'inside', textAlign: 'left' }}
        aria-label="Dealer actions"
      >
        {dealerActionsLogArray.map((log, idx: number) => (
          <li 
            key={idx}
            aria-label={`${log.action} ${log.cardDealt ? 'receiving ' + log.cardDealt : ''}, hand value from ${log.valueBefore} to ${log.valueAfter}`}
          >
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

  // Helper to convert game history to CSV format
  const convertHistoryToCSV = (): string => {
    if (!history.length) return '';

    // CSV header
    const headers = [
      'Time', 'Hand Number', 'Initial Cards', 'Final Cards', 'Final Score', 
      'Actions', 'Was Correct', 'Optimal Play', 'Dealer Upcard', 'Dealer Final Cards',
      'Dealer Score', 'Outcome'
    ];
    
    const csvRows = [headers.join(',')];
    
    history.forEach((entry) => {
      entry.playerHands.forEach((hand, handIndex) => {
        const actions = hand.actions.map((a) => `${a.action}${a.cardDealt ? ' (' + a.cardDealt + ')' : ''}`).join('; ');
        const wasCorrect = hand.actions.map((a) => a.correct ? 'Yes' : 'No').join('; ');
        const optimalPlays = hand.actions.map((a) => a.optimal).join('; ');
        
        const row = [
          `"${new Date(entry.timestamp).toLocaleString()}"`,
          handIndex + 1,
          `"${hand.initialCards}"`,
          `"${hand.finalCards}"`,
          hand.finalScore + (hand.busted ? ' BUST' : '') + (hand.surrendered ? ' SURRENDER' : '') + (hand.isBlackjack ? ' BJ' : ''),
          `"${actions}"`,
          `"${wasCorrect}"`,
          `"${optimalPlays}"`,
          `"${entry.dealerUpCard}"`,
          `"${entry.dealerFinalCards}"`,
          entry.dealerFinalScore,
          hand.outcome
        ];
        
        csvRows.push(row.join(','));
      });
    });
    
    return csvRows.join('\n');
  };

  // Download history as CSV file
  const downloadCSV = () => {
    const csvContent = convertHistoryToCSV();
    if (!csvContent) return;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `blackjack_history_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    // Add to document, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics for display
  const totalHands = stats.correctMoves + stats.incorrectMoves;
  const correctPercentage = calculatePercentage(stats.correctMoves, totalHands);
  const winsPercentage = calculatePercentage(stats.wins, stats.wins + stats.losses + stats.pushes);

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="history-dialog-title"
      aria-describedby="history-dialog-description"
    >
      <div ref={dialogRef}>
        <DialogTitle 
          id="history-dialog-title"
          sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="h6" component="span">Game History</Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={downloadCSV}
              startIcon={<DownloadIcon />}
              disabled={history.length === 0}
              aria-label="Download history as CSV file"
            >
              Export CSV
            </Button>
            <Button 
              variant="outlined" 
              color="warning" 
              onClick={onNewSession}
              startIcon={<RestartAltIcon />}
              aria-label="Start a new session and reset statistics"
            >
              New Session
            </Button>
            <IconButton
              edge="end"
              onClick={onClose}
              aria-label="Close dialog"
              ref={closeButtonRef}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {/* Session Statistics */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Session Statistics</Typography>
            <TableContainer component={Paper} elevation={2}>
              <Table size="small" aria-label="Session statistics table">
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">Hands Played</TableCell>
                    <TableCell align="right">{stats.handsPlayed}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Win Rate</TableCell>
                    <TableCell align="right">{winsPercentage} ({stats.wins} / {stats.wins + stats.losses + stats.pushes})</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Correct Decisions</TableCell>
                    <TableCell align="right">{correctPercentage} ({stats.correctMoves} / {totalHands})</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Total Wins</TableCell>
                    <TableCell align="right">{stats.wins}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Total Losses</TableCell>
                    <TableCell align="right">{stats.losses}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">Total Pushes</TableCell>
                    <TableCell align="right">{stats.pushes}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Game History */}
          <Typography variant="h6" gutterBottom>Hand History</Typography>
          
          {history.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }} role="status">
              <Typography variant="body1">No game history yet. Play a few hands to see them here!</Typography>
            </Box>
          ) : (
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
          )}
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default HistoryModal;
