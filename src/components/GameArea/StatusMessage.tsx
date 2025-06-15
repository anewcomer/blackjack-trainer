import React from 'react';
import { Box, Typography, Fade } from '@mui/material';

interface StatusMessageProps {
  message: string | null;
}

/**
 * Component for displaying game status messages with fade animations
 */
const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <Fade in={!!message}>
      <Box 
        sx={{ 
          width: '100%', 
          textAlign: 'center', 
          mt: 1,
          p: 1,
          fontWeight: 'bold',
          color: 'text.primary'
        }}
        role="status"
        aria-live="assertive"
      >
        <Typography variant="body1">{message}</Typography>
      </Box>
    </Fade>
  );
};

export default React.memo(StatusMessage);
