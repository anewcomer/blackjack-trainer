import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Alert,
} from '@mui/material';
import {
    ExpandMore,
    Warning,
    Clear,
    TrendingUp,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { clearMistakePatterns, removeMistakePattern } from '../../store/sessionSlice';

export const MistakePatterns: React.FC = () => {
    const dispatch = useAppDispatch();
    const { mistakePatterns } = useAppSelector((state) => state.session);

    const handleClearAll = () => {
        dispatch(clearMistakePatterns());
    };

    const handleRemovePattern = (scenario: string) => {
        dispatch(removeMistakePattern(scenario));
    };

    const getFrequencyColor = (frequency: number) => {
        if (frequency >= 5) return 'error';
        if (frequency >= 3) return 'warning';
        return 'info';
    };

    const getHandTypeDisplay = (tableType: string) => {
        switch (tableType) {
            case 'hard': return 'Hard Total';
            case 'soft': return 'Soft Total';
            case 'pairs': return 'Pair';
            default: return tableType;
        }
    };

    const formatTimeSince = (timestamp: number) => {
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    // Sort patterns by frequency (most frequent first)
    const sortedPatterns = [...mistakePatterns].sort((a, b) => b.frequency - a.frequency);

    if (mistakePatterns.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp />
                        Mistake Patterns
                    </Typography>
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Great job! No mistake patterns detected yet. Keep making optimal decisions!
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning />
                        Mistake Patterns ({mistakePatterns.length})
                    </Typography>
                    <Button
                        size="small"
                        color="error"
                        onClick={handleClearAll}
                        startIcon={<Clear />}
                    >
                        Clear All
                    </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Common mistakes that need attention. Focus on these scenarios to improve your accuracy.
                </Typography>

                <Stack spacing={1} sx={{ mt: 2 }}>
                    {sortedPatterns.map((pattern, index) => (
                        <Accordion key={pattern.scenario} elevation={1}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                sx={{
                                    '& .MuiAccordionSummary-content': {
                                        alignItems: 'center',
                                        gap: 2
                                    }
                                }}
                            >
                                <Chip
                                    label={pattern.frequency}
                                    color={getFrequencyColor(pattern.frequency)}
                                    size="small"
                                    sx={{ minWidth: 40, fontWeight: 'bold' }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                        {getHandTypeDisplay(pattern.tableType)} vs Dealer {pattern.dealerUpcard}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Player: {pattern.playerValue} • Last: {formatTimeSince(pattern.lastOccurrence)}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Mistake Details:
                                        </Typography>
                                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Your Action:
                                                </Typography>
                                                <Chip
                                                    label={pattern.playerAction}
                                                    color="error"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                →
                                            </Typography>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Correct Action:
                                                </Typography>
                                                <Chip
                                                    label={pattern.correctAction}
                                                    color="success"
                                                    size="small"
                                                />
                                            </Box>
                                        </Stack>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Occurred {pattern.frequency} time{pattern.frequency !== 1 ? 's' : ''}
                                        </Typography>
                                        <Button
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            onClick={() => handleRemovePattern(pattern.scenario)}
                                            startIcon={<Clear />}
                                        >
                                            Dismiss
                                        </Button>
                                    </Box>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Stack>

                {mistakePatterns.length > 3 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        💡 Focus on the most frequent mistakes first. Consider practicing these scenarios
                        with the strategy guide before continuing.
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};
