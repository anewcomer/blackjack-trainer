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
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Casino as CasinoIcon,
  Analytics as AnalyticsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  PlayArrow,
  Stop,
  Refresh,
  AccessTime,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { GameArea } from '../game';
import { StrategyGuide } from '../strategy';
import { SessionStats, MistakePatterns, GameHistory } from '../session';
import { ThemeToggle } from '../common';
import { startNewSession, endCurrentSession, resetAllData } from '../../store/sessionSlice';

const GameLayout: React.FC = () => {
  const gamePhase = useAppSelector((state: any) => state.game.gamePhase);
  const { currentSession } = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();
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

  // Session management functions moved from SessionControls
  const handleStartNewSession = () => {
    dispatch(startNewSession());
  };

  const handleEndSession = () => {
    dispatch(endCurrentSession());
  };

  const handleResetAllData = () => {
    if (window.confirm('Are you sure you want to reset all session data? This cannot be undone.')) {
      dispatch(resetAllData());
    }
  };

  const getSessionDuration = () => {
    const durationMs = Date.now() - currentSession.sessionStart;
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const isActiveSession = currentSession.sessionEnd === null;

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* App Header */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <CasinoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Blackjack Trainer
          </Typography>

          {/* Session Status and Progress - moved from SessionControls */}
          {!isMobile && (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 3, mr: 'auto' }}>
              {/* Session Status */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={isActiveSession ? 'Active' : 'Ended'}
                  color={isActiveSession ? 'success' : 'default'}
                  size="small"
                  variant={isActiveSession ? 'filled' : 'outlined'}
                />
                {isActiveSession && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccessTime fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {getSessionDuration()}
                    </Typography>
                  </Stack>
                )}
              </Stack>

              {/* Progress Indicator */}
              {currentSession.handsPlayed > 0 && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {currentSession.handsPlayed} hands • {currentSession.decisionsTotal} decisions
                </Typography>
              )}
            </Stack>
          )}

          {/* Session Action Buttons - moved from SessionControls */}
          {!isMobile && (
            <Stack direction="row" spacing={1} sx={{ mr: 1 }}>
              {isActiveSession ? (
                <Tooltip title="End Session">
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={handleEndSession}
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <Stop />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="New Session">
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={handleStartNewSession}
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <PlayArrow />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Reset all data">
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={handleResetAllData}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Stack>
          )}

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

      {/* Main Content Area - Responsive Layout */}
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, mt: 3, maxWidth: "100%", mx: "auto" }}>
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

                {/* Mobile Session Controls */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                  <Stack spacing={2}>
                    {/* Session Status Row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={isActiveSession ? 'Active' : 'Ended'}
                          color={isActiveSession ? 'success' : 'default'}
                          size="small"
                          variant={isActiveSession ? 'filled' : 'outlined'}
                        />
                        {isActiveSession && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {getSessionDuration()}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      {/* Mobile Action Buttons */}
                      <Stack direction="row" spacing={1}>
                        {isActiveSession ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={handleEndSession}
                            startIcon={<Stop />}
                          >
                            End
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={handleStartNewSession}
                            startIcon={<PlayArrow />}
                          >
                            New
                          </Button>
                        )}

                        <Tooltip title="Reset all data">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={handleResetAllData}
                          >
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    {/* Progress Row */}
                    {currentSession.handsPlayed > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {currentSession.handsPlayed} hands • {currentSession.decisionsTotal} decisions
                      </Typography>
                    )}
                  </Stack>
                </Box>

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
            sx={{
              width: '100%',
              maxWidth: { sm: '100%', md: '1200px' },
              mx: 'auto'
            }}
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
      <Box sx={{
        mt: 3,
        px: { xs: 1, sm: 2, md: 3 },
        maxWidth: { sm: '100%', md: '1200px' },
        mx: 'auto',
        mb: 3
      }}>
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
