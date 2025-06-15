import React from 'react';
import { Stack, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PanToolIcon from '@mui/icons-material/PanTool';
import Filter2Icon from '@mui/icons-material/Filter2'; // Using Filter2 icon for Double
import CallSplitIcon from '@mui/icons-material/CallSplit';
import FlagIcon from '@mui/icons-material/Flag';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import HistoryIcon from '@mui/icons-material/History';

interface ActionsProps {
  onNewGame: () => void;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onSurrender: () => void;
  onShowHistory: () => void;
  playerCanHit: boolean;
  playerCanStand: boolean;
  playerCanDouble: boolean;
  playerCanSplit: boolean;
  playerCanSurrender: boolean;
}
const Actions: React.FC<ActionsProps> = ({
  onNewGame,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onSurrender,
  onShowHistory,
  playerCanHit,
  playerCanStand,
  playerCanDouble,
  playerCanSplit,
  playerCanSurrender,
}) => {
  return (
    <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
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
      >
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onHit} 
          disabled={!playerCanHit}
          startIcon={<AddIcon />}
          fullWidth
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
      >
        <Button 
          variant="outlined" 
          color="success" 
          onClick={onNewGame}
          startIcon={<PlayCircleOutlineIcon />}
          fullWidth
        >
          New Game
        </Button>
        <Button 
          variant="outlined" 
          color="info" 
          onClick={onShowHistory}
          startIcon={<HistoryIcon />}
          fullWidth
        >
          Show History
        </Button>
      </Stack>
    </Box>
  );
};

export default Actions;
