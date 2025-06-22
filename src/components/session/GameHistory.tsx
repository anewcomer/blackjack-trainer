// Game History component for displaying detailed hand history
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    History as HistoryIcon,
    Download as DownloadIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { clearHistory } from '../../store/sessionSlice';
import { GameHistoryEntry, HandHistoryEntry } from '../../types/session';

const GameHistory: React.FC = () => {
    const dispatch = useAppDispatch();
    const gameHistory = useAppSelector((state) => state.session.gameHistory);
    const [modalOpen, setModalOpen] = useState(false);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

    const handleClearHistory = () => {
        dispatch(clearHistory());
        setClearConfirmOpen(false);
    };

    const exportHistory = () => {
        const dataStr = JSON.stringify(gameHistory, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `blackjack-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const getOutcomeColor = (outcome: string) => {
        switch (outcome) {
            case 'WIN': return 'success';
            case 'LOSS': return 'error';
            case 'PUSH': return 'warning';
            case 'SURRENDER': return 'info';
            default: return 'default';
        }
    };

    const renderHandSummary = (hand: HandHistoryEntry) => (
        <Box key={hand.handId} sx={{ mb: 1 }}>
            <Typography variant="body2">
                Hand {hand.handIndex + 1}: {hand.finalCards.join(', ')} = {hand.finalValue}
                {hand.wasSoft && ' (Soft)'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Chip
                    label={hand.outcome}
                    color={getOutcomeColor(hand.outcome) as any}
                    size="small"
                />
                {hand.wasSplit && <Chip label="Split" color="secondary" size="small" />}
                {hand.wasDoubled && <Chip label="Doubled" color="info" size="small" />}
                {hand.wasSurrendered && <Chip label="Surrendered" color="warning" size="small" />}
                {hand.wasBlackjack && <Chip label="Blackjack!" color="success" size="small" />}
            </Stack>
        </Box>
    );

    const renderActionDetails = (hand: HandHistoryEntry) => (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Action</TableCell>
                        <TableCell>Correct?</TableCell>
                        <TableCell>Optimal</TableCell>
                        <TableCell>Card</TableCell>
                        <TableCell>Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hand.actions.map((action, index) => (
                        <TableRow key={index}>
                            <TableCell>{action.action}</TableCell>
                            <TableCell>
                                <Chip
                                    label={action.wasCorrect ? 'Yes' : 'No'}
                                    color={action.wasCorrect ? 'success' : 'error'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>{action.optimalAction}</TableCell>
                            <TableCell>{action.cardReceived || '-'}</TableCell>
                            <TableCell>{action.handValueBefore} → {action.handValueAfter}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'background.paper' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <HistoryIcon />
                    <Typography variant="h6">Game History</Typography>
                    <Chip label={`${gameHistory.length} games`} size="small" />
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Export History">
                        <IconButton onClick={exportHistory} disabled={gameHistory.length === 0}>
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear History">
                        <IconButton onClick={() => setClearConfirmOpen(true)} disabled={gameHistory.length === 0}>
                            <ClearIcon />
                        </IconButton>
                    </Tooltip>
                    <Button variant="outlined" onClick={() => setModalOpen(true)} disabled={gameHistory.length === 0}>
                        View Details
                    </Button>
                </Stack>
            </Stack>

            {/* Recent Games Summary */}
            <Stack spacing={2}>
                {gameHistory.slice(0, 5).map((game: GameHistoryEntry) => (
                    <Card key={game.id} sx={{ backgroundColor: 'background.paper' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="subtitle2">
                                        {formatTime(game.timestamp)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Dealer: {game.initialDealerCard} vs Player: {game.initialPlayerCards.join(', ')}
                                    </Typography>

                                    {/* Hand Results */}
                                    <Box sx={{ mt: 1 }}>
                                        {game.playerHands.map(renderHandSummary)}
                                    </Box>
                                </Box>

                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2">
                                        Accuracy: {Math.round(game.handAccuracy * 100)}%
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        {game.finalResult.wins > 0 && <Chip label={`W: ${game.finalResult.wins}`} color="success" size="small" />}
                                        {game.finalResult.losses > 0 && <Chip label={`L: ${game.finalResult.losses}`} color="error" size="small" />}
                                        {game.finalResult.pushes > 0 && <Chip label={`P: ${game.finalResult.pushes}`} color="warning" size="small" />}
                                    </Stack>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}

                {gameHistory.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No games played yet. Start playing to see your history!
                    </Typography>
                )}
            </Stack>

            {/* Detailed History Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Detailed Game History</DialogTitle>
                <DialogContent>
                    {gameHistory.map((game: GameHistoryEntry) => (
                        <Accordion key={game.id}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Stack direction="row" justifyContent="space-between" width="100%">
                                    <Typography>{formatTime(game.timestamp)}</Typography>
                                    <Typography color="text.secondary">
                                        {Math.round(game.handAccuracy * 100)}% accuracy
                                    </Typography>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack spacing={2}>
                                    <Typography variant="subtitle2">
                                        Initial Deal: {game.initialPlayerCards.join(', ')} vs Dealer {game.initialDealerCard}
                                    </Typography>

                                    {game.playerHands.map((hand: HandHistoryEntry) => (
                                        <Box key={hand.handId}>
                                            <Typography variant="h6">Hand {hand.handIndex + 1}</Typography>
                                            {renderHandSummary(hand)}
                                            {renderActionDetails(hand)}
                                        </Box>
                                    ))}

                                    <Typography variant="subtitle2">
                                        Dealer Final: {game.dealerFinalHand.join(', ')} = {game.dealerFinalValue}
                                    </Typography>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Clear Confirmation Dialog */}
            <Dialog open={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)}>
                <DialogTitle>Clear Game History?</DialogTitle>
                <DialogContent>
                    <Typography>
                        This will permanently delete all {gameHistory.length} games from your history.
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleClearHistory} color="error" variant="contained">
                        Clear History
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GameHistory;
