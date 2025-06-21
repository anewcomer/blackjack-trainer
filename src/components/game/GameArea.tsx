// Placeholder GameArea component - will be fully implemented in Phase 3
import React from 'react';
import { Typography, Box, Button, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const GameArea: React.FC = () => {
  const dispatch = useAppDispatch();
  
  return (
    <Box sx={{ textAlign: 'center', color: 'white' }}>
      <Typography variant="h4" gutterBottom>
        Blackjack Game Area
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 4 }}>
        Phase 1 Complete - Game logic and Redux store ready!
      </Typography>
      
      <Stack spacing={2} direction="row" justifyContent="center">
        <Button variant="contained" color="error" size="large">
          Hit
        </Button>
        <Button variant="contained" color="success" size="large">
          Stand
        </Button>
        <Button variant="contained" color="info" size="large">
          Double
        </Button>
        <Button variant="contained" color="warning" size="large">
          Split
        </Button>
      </Stack>
      
      <Typography variant="body1" sx={{ mt: 4, opacity: 0.8 }}>
        Next: Implement core game components and card rendering
      </Typography>
    </Box>
  );
};

export default GameArea;
