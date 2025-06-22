// Animated Card component for blackjack cards with visual polish
import React from 'react';
import {
    Box,
    Typography,
    useTheme,
    Fade,
    Slide,
} from '@mui/material';
import type { Card as CardType } from '../../types/game';

interface AnimatedCardProps {
    card: CardType;
    hidden?: boolean;
    size?: 'small' | 'medium' | 'large';
    index?: number;
    isNew?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
    card,
    hidden = false,
    size = 'medium',
    index = 0,
    isNew = false
}) => {
    const theme = useTheme();

    const getSuitSymbol = (suit: string) => {
        switch (suit.toLowerCase()) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return suit;
        }
    };

    const getSuitColor = (suit: string) => {
        return ['hearts', 'diamonds'].includes(suit.toLowerCase()) ? '#d32f2f' : '#000000';
    };

    const getCardSize = () => {
        switch (size) {
            case 'small': return { width: 50, height: 75 };
            case 'large': return { width: 90, height: 135 };
            default: return { width: 70, height: 105 };
        }
    };

    const cardSize = getCardSize();

    return (
        <Slide
            direction="up"
            in={true}
            timeout={300 + (index * 100)}
            mountOnEnter
            unmountOnExit
        >
            <Fade
                in={true}
                timeout={500 + (index * 100)}
            >
                <Box
                    sx={{
                        ...cardSize,
                        backgroundColor: hidden ? '#1a5490' : '#ffffff',
                        border: '2px solid #000000',
                        borderRadius: 1, // Reduced from 2 to 1 for flatter, more traditional card look
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 0.5,
                        position: 'relative',
                        cursor: 'default',
                        boxShadow: theme.shadows[3],
                        transition: 'all 0.3s ease-in-out',
                        transform: isNew ? 'scale(1.1)' : 'scale(1)',
                        '&:hover': {
                            boxShadow: theme.shadows[6],
                            transform: 'scale(1.05)',
                        },
                        // Card pattern for hidden cards
                        ...(hidden && {
                            backgroundImage: 'repeating-linear-gradient(45deg, #1a5490 0px, #1a5490 10px, #2196f3 10px, #2196f3 20px)',
                        }),
                    }}
                    role="img"
                    aria-label={hidden ? 'Hidden card' : `${card.rank} of ${card.suit}`}
                >
                    {!hidden ? (
                        <>
                            {/* Top-left corner */}
                            <Box sx={{
                                alignSelf: 'flex-start',
                                color: getSuitColor(card.suit),
                                lineHeight: 1,
                            }}>
                                <Typography
                                    variant={size === 'small' ? 'caption' : 'body2'}
                                    fontWeight="bold"
                                    sx={{ fontSize: size === 'large' ? '1.2rem' : undefined }}
                                >
                                    {card.rank}
                                </Typography>
                                <Typography
                                    variant={size === 'small' ? 'caption' : 'body1'}
                                    sx={{
                                        fontSize: size === 'large' ? '1.5rem' : size === 'small' ? '0.8rem' : '1.2rem',
                                        lineHeight: 1,
                                    }}
                                >
                                    {getSuitSymbol(card.suit)}
                                </Typography>
                            </Box>

                            {/* Center suit symbol */}
                            <Typography
                                variant="h4"
                                sx={{
                                    color: getSuitColor(card.suit),
                                    fontSize: size === 'large' ? '3rem' : size === 'small' ? '1.5rem' : '2rem',
                                    lineHeight: 1,
                                }}
                            >
                                {getSuitSymbol(card.suit)}
                            </Typography>

                            {/* Bottom-right corner (rotated) */}
                            <Box sx={{
                                alignSelf: 'flex-end',
                                color: getSuitColor(card.suit),
                                transform: 'rotate(180deg)',
                                lineHeight: 1,
                            }}>
                                <Typography
                                    variant={size === 'small' ? 'caption' : 'body2'}
                                    fontWeight="bold"
                                    sx={{ fontSize: size === 'large' ? '1.2rem' : undefined }}
                                >
                                    {card.rank}
                                </Typography>
                                <Typography
                                    variant={size === 'small' ? 'caption' : 'body1'}
                                    sx={{
                                        fontSize: size === 'large' ? '1.5rem' : size === 'small' ? '0.8rem' : '1.2rem',
                                        lineHeight: 1,
                                    }}
                                >
                                    {getSuitSymbol(card.suit)}
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        // Hidden card content
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#ffffff',
                        }}>
                            <Typography
                                variant={size === 'large' ? 'h6' : 'body2'}
                                fontWeight="bold"
                            >
                                ?
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Fade>
        </Slide>
    );
};

export default AnimatedCard;
