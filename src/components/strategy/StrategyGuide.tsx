// Placeholder StrategyGuide component - will be fully implemented in Phase 4
import React from 'react';
import { 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DEALER_UPCARDS, ACTION_DESCRIPTIONS } from '../../data/strategyCharts';

const StrategyGuide: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Basic Strategy Guide
      </Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Hard" />
        <Tab label="Soft" />
        <Tab label="Pairs" />
      </Tabs>
      
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Action Legend
        </Typography>
        {Object.entries(ACTION_DESCRIPTIONS).map(([action, desc]) => (
          <Box key={action} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor: desc.color,
                borderRadius: 1,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem',
              }}
            >
              {action}
            </Box>
            <Typography variant="body2">
              {desc.label}: {desc.description}
            </Typography>
          </Box>
        ))}
      </Paper>
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Hand</TableCell>
              {DEALER_UPCARDS.map(upcard => (
                <TableCell key={upcard} align="center">{upcard}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Sample</TableCell>
              {DEALER_UPCARDS.map(upcard => (
                <TableCell key={upcard} align="center" 
                  sx={{ backgroundColor: '#f44336', color: 'white', fontWeight: 'bold' }}>
                  H
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Strategy tables will be fully interactive in Phase 4
      </Typography>
    </Box>
  );
};

export default StrategyGuide;
