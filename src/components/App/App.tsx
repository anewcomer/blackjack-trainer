import React, { useEffect } from 'react';
import GameArea from '../GameArea/GameArea';
import Actions from '../Actions/Actions';
import StrategyGuide from '../StrategyGuide/StrategyGuide';
import HistoryModal from '../HistoryModal/HistoryModal';
import { BlackjackProvider, useBlackjack } from '../../context/BlackjackContext';
import { Box, Container, Typography } from '@mui/material';
import useKeyboardNavigation from '../../hooks/useKeyboardNavigation';

/**
 * Main application content component that uses the Blackjack context
 * Enhanced with proper semantic HTML and accessibility features
 */
const AppContent: React.FC = () => {
  // Get the newGameHandler from context
  const { newGameHandler } = useBlackjack();
  
  // Add keyboard navigation support
  useKeyboardNavigation();
  
  // Start a new game when the component mounts
  useEffect(() => {
    newGameHandler();
    // We only want to run this once when the app loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box 
      component="main"
      sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}
    >
      <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {/* Skip to main content link for keyboard users */}
        <a href="#game-content" className="skip-link">
          Skip to game content
        </a>
        
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ mb: 3 }}
        >
          Blackjack Trainer
        </Typography>
        
        <Box 
          id="game-content"
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            flex: 1, 
            minHeight: 500, 
            gap: 3 
          }}
          tabIndex={-1} // Makes it focusable for skip link without affecting tab order
        >
          <Box 
            component="section"
            sx={{ 
              flex: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'flex-start' 
            }}
            aria-label="Game play area"
          >
            <GameArea />
            <Actions />
          </Box>
          
          <Box 
            component="aside"
            sx={{ flex: 1, minWidth: 0 }}
            aria-label="Strategy guide"
          >
            <StrategyGuide />
          </Box>
        </Box>
        
        {/* The modal is controlled separately */}
        <HistoryModal />
        
        {/* Footer with accessibility information */}
        <Box 
          component="footer" 
          sx={{ 
            mt: 4, 
            pt: 2, 
            borderTop: '1px solid', 
            borderColor: 'divider', 
            textAlign: 'center' 
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Keyboard shortcuts: 'H' - Hit, 'S' - Stand, 'D' - Double, 'P' - Split, 'R' - Surrender, 'N' - New Game, 'I' - History
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

/**
 * Main App component that provides the Blackjack context
 */
const App: React.FC = () => {
  return (
    <BlackjackProvider>
      <AppContent />
    </BlackjackProvider>
  );
};

export default App;
