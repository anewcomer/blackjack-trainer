import React from 'react';
import { Stack, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PanToolIcon from '@mui/icons-material/PanTool';
import Filter2Icon from '@mui/icons-material/Filter2'; // Using Filter2 icon for Double
import CallSplitIcon from '@mui/icons-material/CallSplit';
import FlagIcon from '@mui/icons-material/Flag';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import { useBlackjack } from '../../context/BlackjackContext';

/**
 * Actions component that displays all game action buttons
 * Enhanced with full accessibility support
 */
const Actions: React.FC = () => {
  const {
    newGameHandler: onNewGame,
    hitHandler: onHit,
    standHandler: onStand,
    doubleHandler: onDouble,
    splitHandler: onSplit,
    surrenderHandler: onSurrender,
    showHistoryHandler: onShowHistory,
    playerCanHit,
    playerCanStand,
    playerCanDouble,
    playerCanSplit,
    playerCanSurrender,
  } = useBlackjack();

  return (
    <Box 
      sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}
      role="group"
      aria-label="Game actions"
    >
      {/* Game action buttons - first row */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          justifyContent: 'center',
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(5, 1fr)'
          },
          gap: 1
        }}
        role="toolbar"
        aria-label="Player actions"
      >
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onHit} 
          disabled={!playerCanHit}
          startIcon={<AddIcon />}
          fullWidth
          aria-label="Hit"
          aria-disabled={!playerCanHit}
        >
          Hit
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onStand} 
          disabled={!playerCanStand}
          startIcon={<PanToolIcon />}
          fullWidth
          aria-label="Stand"
          aria-disabled={!playerCanStand}
        >
          Stand
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={onDouble} 
          disabled={!playerCanDouble}
          startIcon={<Filter2Icon />}
          fullWidth
          aria-label="Double down"
          aria-disabled={!playerCanDouble}
        >
          Double
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={onSplit} 
          disabled={!playerCanSplit}
          startIcon={<CallSplitIcon />}
          fullWidth
          aria-label="Split hand"
          aria-disabled={!playerCanSplit}
        >
          Split
        </Button>
        <Button 
          variant="contained" 
          color="warning" 
          onClick={onSurrender} 
          disabled={!playerCanSurrender}
          startIcon={<FlagIcon />}
          fullWidth
          aria-label="Surrender hand"
          aria-disabled={!playerCanSurrender}
        >
          Surrender
        </Button>
      </Stack>

      {/* Game control buttons - second row */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          justifyContent: 'center',
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)',
          },
          gap: 1,
          maxWidth: { xs: '100%', sm: '80%', md: '60%' },
          mx: 'auto'
        }}
        role="toolbar"
        aria-label="Game controls"
      >
        <Button 
          variant="outlined" 
          color="success" 
          onClick={onNewGame}
          startIcon={<PlayCircleOutlineIcon />}
          fullWidth
          aria-label="Start new game"
        >
          New Game
        </Button>
        <Button 
          variant="outlined" 
          color="info" 
          onClick={onShowHistory}
          startIcon={<HistoryIcon />}
          fullWidth
          aria-label="Show game history"
        >
          Show History
        </Button>
      </Stack>
    </Box>
  );
};

export default Actions;
