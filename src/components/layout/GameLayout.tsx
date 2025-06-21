// Main layout component for the Blackjack Trainer application
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Stack,
} from '@mui/material';
import {
  School as SchoolIcon,
  Casino as CasinoIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { GameArea } from '../game';
import { StrategyGuide } from '../strategy';
import { SessionStats, MistakePatterns, SessionControls, GameHistory } from '../session';

const GameLayout: React.FC = () => {
  const gamePhase = useAppSelector((state: any) => state.game.gamePhase);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Header */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <CasinoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blackjack Trainer
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="strategy guide"
          >
            <SchoolIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Session Controls */}
      <Box sx={{ mb: 2 }}>
        <SessionControls />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ mt: 2 }}>
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          spacing={3}
          sx={{ width: '100%' }}
        >
          {/* Game Area - Left Side */}
          <Box sx={{ flex: { xs: 1, xl: 2 } }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                minHeight: '600px',
                background: theme => theme.palette.blackjack.table,
                color: 'white',
              }}
            >
              <GameArea />
            </Paper>
          </Box>

          {/* Strategy Guide - Center */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ p: 2, minHeight: '600px' }}>
              <StrategyGuide />
            </Paper>
          </Box>

          {/* Session Analytics - Right Side */}
          <Box sx={{ flex: 1, minWidth: { xl: '350px' } }}>
            <Stack spacing={3}>
              <SessionStats />
              <MistakePatterns />
              <GameHistory />
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Game Status Footer */}
      <Box sx={{ mt: 3 }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Game Phase: {gamePhase || 'INITIAL'} |
            Use the strategy guide on the right to make optimal decisions
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default GameLayout;
