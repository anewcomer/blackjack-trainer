import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    Chip,
    Stack,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    EmojiEvents,
    Casino,
    Speed,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';

export const SessionStats: React.FC = () => {
    const { currentSession, skillLevel } = useAppSelector((state) => state.session);

    const getTrendIcon = (trend: number) => {
        if (trend > 2) return <TrendingUp color="success" />;
        if (trend < -2) return <TrendingDown color="error" />;
        return <TrendingFlat color="action" />;
    };

    const getTrendColor = (trend: number) => {
        if (trend > 2) return 'success.main';
        if (trend < -2) return 'error.main';
        return 'text.secondary';
    };

    const getSkillLevelColor = (level: string) => {
        switch (level) {
            case 'ADVANCED': return 'success';
            case 'INTERMEDIATE': return 'warning';
            case 'BEGINNER': return 'info';
            default: return 'default';
        }
    };

    const winRate = currentSession.handsPlayed > 0
        ? ((currentSession.wins / currentSession.handsPlayed) * 100).toFixed(1)
        : '0';

    const blackjackRate = currentSession.handsPlayed > 0
        ? ((currentSession.blackjacks / currentSession.handsPlayed) * 100).toFixed(1)
        : '0';

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed />
                    Session Statistics
                </Typography>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    sx={{ mb: 3 }}
                >
                    {/* Main Stats */}
                    <Box sx={{ flex: 1 }}>
                        <Stack spacing={2}>
                            {/* Accuracy */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Strategy Accuracy
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {currentSession.accuracy.toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={currentSession.accuracy}
                                    sx={{ height: 8, borderRadius: 1 }} // Reduced from 4 to 1 for flatter look
                                    color={currentSession.accuracy >= 85 ? 'success' : currentSession.accuracy >= 70 ? 'warning' : 'error'}
                                />
                            </Box>

                            {/* Decisions */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Decisions Made
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {currentSession.decisionsCorrect}/{currentSession.decisionsTotal}
                                </Typography>
                            </Box>

                            {/* Hands Played */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Hands Played
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {currentSession.handsPlayed}
                                </Typography>
                            </Box>

                            {/* Skill Level */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Skill Level
                                </Typography>
                                <Chip
                                    label={skillLevel}
                                    color={getSkillLevelColor(skillLevel)}
                                    size="small"
                                    icon={<EmojiEvents />}
                                />
                            </Box>
                        </Stack>
                    </Box>

                    {/* Game Outcomes */}
                    <Box sx={{ flex: 1 }}>
                        <Stack spacing={2}>
                            {/* Win Rate */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Win Rate
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {winRate}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={parseFloat(winRate)}
                                    sx={{ height: 8, borderRadius: 1 }} // Reduced from 4 to 1 for flatter look
                                    color={parseFloat(winRate) >= 45 ? 'success' : parseFloat(winRate) >= 40 ? 'warning' : 'error'}
                                />
                            </Box>

                            {/* Game Results */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                    W / L / P
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {currentSession.wins} / {currentSession.losses} / {currentSession.pushes}
                                </Typography>
                            </Box>

                            {/* Blackjacks */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Blackjacks
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Casino fontSize="small" />
                                    {currentSession.blackjacks} ({blackjackRate}%)
                                </Typography>
                            </Box>

                            {/* Improvement Trend */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Trend
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {getTrendIcon(currentSession.improvementTrend)}
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                        sx={{ color: getTrendColor(currentSession.improvementTrend) }}
                                    >
                                        {currentSession.improvementTrend >= 0 ? '+' : ''}{currentSession.improvementTrend.toFixed(1)}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>

                {/* Recent Accuracy Indicator */}
                {currentSession.recentAccuracy.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Recent Performance (Last {currentSession.recentAccuracy.length} hands)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'end', height: 40 }}>
                            {currentSession.recentAccuracy.map((accuracy, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: 6,
                                        height: `${Math.max(accuracy, 5)}%`,
                                        backgroundColor: accuracy >= 85 ? 'success.main' : accuracy >= 70 ? 'warning.main' : 'error.main',
                                        borderRadius: 1,
                                        opacity: 0.7 + (index / currentSession.recentAccuracy.length) * 0.3,
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
