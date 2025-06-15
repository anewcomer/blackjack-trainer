import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useBlackjack } from '../../context/BlackjackContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useModalAccessibility } from './useModalAccessibility';
import { downloadHistoryCSV } from './HistoryUtils';
import SessionStats from './SessionStats';
import GameHistoryTable from './GameHistoryTable';

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

  // Use our custom hook for modal accessibility
  const { dialogRef, closeButtonRef } = useModalAccessibility({ isOpen, onClose });

  // Handler for starting a new session
  const onNewSession = () => {
    resetSessionStats();
    newGameHandler();
    onClose();
  };

  // Handler for downloading CSV
  const handleDownloadCSV = () => {
    downloadHistoryCSV(history);
  };

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
              onClick={handleDownloadCSV}
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
          <SessionStats stats={stats} />

          {/* Game History */}
          <Typography variant="h6" gutterBottom>Hand History</Typography>
          <GameHistoryTable history={history} />
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default HistoryModal;
