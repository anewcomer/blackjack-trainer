import React from 'react';
import { Stack, Button } from '@mui/material';

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
    <Stack direction="row" spacing={1} sx={{ my: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
      <Button variant="contained" color="primary" onClick={onHit} disabled={!playerCanHit}>Hit</Button>
      <Button variant="contained" color="primary" onClick={onStand} disabled={!playerCanStand}>Stand</Button>
      <Button variant="contained" color="secondary" onClick={onDouble} disabled={!playerCanDouble}>Double</Button>
      <Button variant="contained" color="secondary" onClick={onSplit} disabled={!playerCanSplit}>Split</Button>
      <Button variant="contained" color="warning" onClick={onSurrender} disabled={!playerCanSurrender}>Surrender</Button>
      <Button variant="outlined" color="success" onClick={onNewGame}>New Game</Button>
      <Button variant="outlined" color="info" onClick={onShowHistory}>Show History</Button>
    </Stack>
  );
};

export default Actions;
