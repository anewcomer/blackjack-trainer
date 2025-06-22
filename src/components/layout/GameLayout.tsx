// Main layout component for the Blackjack Trainer application
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Stack,
  Drawer,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import {
  School as SchoolIcon,
  Casino as CasinoIcon,
  Analytics as AnalyticsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { GameArea } from '../game';
import { StrategyGuide } from '../strategy';
import { SessionStats, MistakePatterns, SessionControls, GameHistory } from '../session';
import { ThemeToggle } from '../common';

const GameLayout: React.FC = () => {
  const gamePhase = useAppSelector((state: any) => state.game.gamePhase);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [strategyDrawerOpen, setStrategyDrawerOpen] = useState(false);

  const handleStrategyToggle = () => {
    setStrategyDrawerOpen(!strategyDrawerOpen);
  };

  const handleMobileMenuToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* App Header */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <CasinoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blackjack Trainer
          </Typography>

          {/* Theme Toggle - Always visible */}
          <ThemeToggle />

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="mobile menu"
              onClick={handleMobileMenuToggle}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Desktop Strategy Button */}
          {!isMobile && (
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="strategy guide"
              onClick={handleStrategyToggle}
            >
              <SchoolIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Session Controls - Always visible */}
      <Box sx={{ mb: 2, px: { xs: 1, sm: 2 } }}>
        <SessionControls />
      </Box>

      {/* Main Content Area - Responsive Layout */}
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {isMobile ? (
          // Mobile Layout: Stack vertically with tabs/drawers
          <Stack spacing={2}>
            {/* Game Area - Primary focus on mobile */}
            <Paper
              elevation={3}
              sx={{
                p: { xs: 1, sm: 2 },
                minHeight: '400px',
                background: theme => theme.palette.blackjack?.table || 'green',
                color: 'white',
              }}
            >
              <GameArea />
            </Paper>

            {/* Mobile Analytics Drawer */}
            <Drawer
              anchor="bottom"
              open={mobileDrawerOpen}
              onClose={handleMobileMenuToggle}
              PaperProps={{
                sx: {
                  height: '70vh',
                  borderTopLeftRadius: 4, // Reduced from 16 to 4 for flatter look
                  borderTopRightRadius: 4, // Reduced from 16 to 4 for flatter look
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Analytics & Strategy</Typography>
                  <IconButton onClick={handleMobileMenuToggle}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
                <Stack spacing={2}>
                  <StrategyGuide />
                  <SessionStats />
                  <MistakePatterns />
                  <GameHistory />
                </Stack>
              </Box>
            </Drawer>

            {/* Floating Action Button for Analytics */}
            <Fab
              color="primary"
              aria-label="analytics"
              onClick={handleMobileMenuToggle}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1000,
              }}
            >
              <AnalyticsIcon />
            </Fab>
          </Stack>
        ) : (
          // Desktop/Tablet Layout: Three columns
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={3}
            sx={{ width: '100%' }}
          >
            {/* Game Area - Left Side */}
            <Box sx={{ flex: { xs: 1, lg: 2 } }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  minHeight: '600px',
                  background: theme => theme.palette.blackjack?.table || 'green',
                  color: 'white',
                }}
              >
                <GameArea />
              </Paper>
            </Box>

            {/* Strategy Guide - Center (Hidden in drawer on tablet) */}
            {isTablet ? (
              <Drawer
                anchor="right"
                open={strategyDrawerOpen}
                onClose={handleStrategyToggle}
                PaperProps={{
                  sx: { width: '400px', p: 2 }
                }}
              >
                <StrategyGuide />
              </Drawer>
            ) : (
              <Box sx={{ flex: 1 }}>
                <Paper elevation={2} sx={{ p: 2, minHeight: '600px' }}>
                  <StrategyGuide />
                </Paper>
              </Box>
            )}

            {/* Session Analytics - Right Side */}
            <Box sx={{ flex: 1, minWidth: { lg: '350px' } }}>
              <Stack spacing={3}>
                <SessionStats />
                <MistakePatterns />
                <GameHistory />
              </Stack>
            </Box>
          </Stack>
        )}
      </Box>

      {/* Game Status Footer */}
      <Box sx={{ mt: 3, px: { xs: 1, sm: 2 } }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Game Phase: {gamePhase || 'INITIAL'} |
            Use the strategy guide to make optimal decisions
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default GameLayout;
