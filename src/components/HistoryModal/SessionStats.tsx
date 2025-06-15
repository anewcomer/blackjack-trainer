import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography
} from '@mui/material';
import { calculatePercentage } from './HistoryUtils';

interface SessionStatsProps {
  stats: {
    handsPlayed: number;
    wins: number;
    losses: number;
    pushes: number;
    correctMoves: number;
    incorrectMoves: number;
  };
}

/**
 * Component for displaying session statistics in a table
 */
const SessionStats: React.FC<SessionStatsProps> = ({ stats }) => {
  // Calculate statistics for display
  const totalHands = stats.correctMoves + stats.incorrectMoves;
  const correctPercentage = calculatePercentage(stats.correctMoves, totalHands);
  const winsPercentage = calculatePercentage(stats.wins, stats.wins + stats.losses + stats.pushes);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>Session Statistics</Typography>
      <TableContainer component={Paper} elevation={2}>
        <Table size="small" aria-label="Session statistics table">
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              <TableCell align="right">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row">Hands Played</TableCell>
              <TableCell align="right">{stats.handsPlayed}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">Win Rate</TableCell>
              <TableCell align="right">{winsPercentage} ({stats.wins} / {stats.wins + stats.losses + stats.pushes})</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">Correct Decisions</TableCell>
              <TableCell align="right">{correctPercentage} ({stats.correctMoves} / {totalHands})</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">Total Wins</TableCell>
              <TableCell align="right">{stats.wins}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">Total Losses</TableCell>
              <TableCell align="right">{stats.losses}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">Total Pushes</TableCell>
              <TableCell align="right">{stats.pushes}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default React.memo(SessionStats);
