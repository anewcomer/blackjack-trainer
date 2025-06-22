// Material-UI theme configuration for the Blackjack Trainer

import { createTheme, ThemeOptions } from '@mui/material/styles';

// Extend the theme with custom colors for blackjack-specific elements
declare module '@mui/material/styles' {
  interface Palette {
    blackjack: {
      table: string;
      cardBackground: string;
      cardBorder: string;
      dealerArea: string;
      playerArea: string;
      correct: string;
      incorrect: string;
      neutral: string;
    };
  }

  interface PaletteOptions {
    blackjack?: {
      table?: string;
      cardBackground?: string;
      cardBorder?: string;
      dealerArea?: string;
      playerArea?: string;
      correct?: string;
      incorrect?: string;
      neutral?: string;
    };
  }
}

// Custom color palette for the blackjack theme
const blackjackColors = {
  table: '#0f5132', // Dark green for table background
  cardBackground: '#ffffff',
  cardBorder: '#333333',
  dealerArea: '#1a5c3a', // Slightly lighter green for dealer area
  playerArea: '#155724', // Medium green for player area
  correct: '#4caf50', // Green for correct decisions
  incorrect: '#f44336', // Red for incorrect decisions
  neutral: '#757575', // Gray for neutral feedback
};

// Strategy action colors
const strategyColors = {
  hit: '#f44336', // Red
  stand: '#4caf50', // Green
  double: '#2196f3', // Blue
  split: '#ff9800', // Orange
  surrender: '#9c27b0', // Purple
};

// Enhanced theme creator with dark mode support
export const createBlackjackTheme = (isDarkMode: boolean = false) => {
  // Base theme colors
  const baseColors = isDarkMode ? {
    table: '#1a4332', // Darker green for dark mode
    cardBackground: '#2d2d2d',
    cardBorder: '#555555',
    dealerArea: '#2a5c4a',
    playerArea: '#235734',
    correct: '#66bb6a',
    incorrect: '#ef5350',
    neutral: '#bdbdbd',
  } : blackjackColors;

  const themeOptions: ThemeOptions = {
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#388e3c',
        light: '#66bb6a',
        dark: '#2e7d32',
      },
      error: {
        main: '#d32f2f',
      },
      warning: {
        main: '#f57c00',
      },
      info: {
        main: '#1976d2',
      },
      success: {
        main: '#388e3c',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
      blackjack: baseColors,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1rem',
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '1rem',
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 2, // Reduced from 8 to 2 for flatter look
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    components: {
      // Card component styling
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          },
        },
      },

      // Button styling for game actions
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 2, // Reduced from 8 to 2 for flatter look
            padding: '8px 16px',
            fontSize: '1rem',
            fontWeight: 600,
          },
          containedPrimary: {
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            '&:disabled': {
              backgroundColor: '#bbbbbb',
              color: '#666666',
            },
          },
          containedSecondary: {
            backgroundColor: '#388e3c',
            '&:hover': {
              backgroundColor: '#2e7d32',
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },

      // Floating Action Button styling
      MuiFab: {
        styleOverrides: {
          root: {
            borderRadius: 4, // Reduced rounded corners for flatter look (FABs can be slightly more rounded than buttons)
          },
        },
      },

      // Drawer styling
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0, // No rounded corners for drawers for cleaner look
          },
        },
      },

      // Dialog/Modal styling
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 2, // Minimal rounded corners for dialogs
          },
        },
      },

      // Chip styling for action feedback
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
          colorSuccess: {
            backgroundColor: blackjackColors.correct,
            color: 'white',
          },
          colorError: {
            backgroundColor: blackjackColors.incorrect,
            color: 'white',
          },
        },
      },

      // Table styling for strategy charts
      MuiTable: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: '#f5f5f5',
              fontWeight: 600,
              borderBottom: '2px solid #e0e0e0',
            },
            '& .MuiTableCell-body': {
              borderBottom: '1px solid #e0e0e0',
            },
          },
        },
      },

      // Snackbar styling for feedback messages
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiSnackbarContent-root': {
              borderRadius: 2, // Reduced from 8 to 2 for flatter look
              fontWeight: 500,
            },
          },
        },
      },

      // Paper component for game areas
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          },
          elevation2: {
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
          },
          elevation3: {
            boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
          },
        },
      },

      // Typography for better card text
      MuiTypography: {
        styleOverrides: {
          root: {
            // Better text rendering
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      },

      // Container for responsive layout
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: 16,
            paddingRight: 16,
            '@media (min-width: 600px)': {
              paddingLeft: 24,
              paddingRight: 24,
            },
          },
        },
      },
    },
  };

  // Custom theme variants for specific blackjack elements
  const blackjackTheme = createTheme({
    ...themeOptions,
    components: {
      ...themeOptions.components,

      // Custom action button variants
      MuiButton: {
        ...themeOptions.components?.MuiButton,
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              '&.action-hit': {
                backgroundColor: strategyColors.hit,
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
              },
              '&.action-stand': {
                backgroundColor: strategyColors.stand,
                '&:hover': {
                  backgroundColor: '#2e7d32',
                },
              },
              '&.action-double': {
                backgroundColor: strategyColors.double,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              },
              '&.action-split': {
                backgroundColor: strategyColors.split,
                '&:hover': {
                  backgroundColor: '#ef6c00',
                },
              },
              '&.action-surrender': {
                backgroundColor: strategyColors.surrender,
                '&:hover': {
                  backgroundColor: '#7b1fa2',
                },
              },
            },
          },
        ],
      },

      // Custom table cell variants for strategy charts
      MuiTableCell: {
        variants: [
          {
            props: { className: 'strategy-cell' },
            style: {
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              padding: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              '&.strategy-hit': {
                backgroundColor: strategyColors.hit,
                color: 'white',
              },
              '&.strategy-stand': {
                backgroundColor: strategyColors.stand,
                color: 'white',
              },
              '&.strategy-double': {
                backgroundColor: strategyColors.double,
                color: 'white',
              },
              '&.strategy-split': {
                backgroundColor: strategyColors.split,
                color: 'white',
              },
              '&.strategy-surrender': {
                backgroundColor: strategyColors.surrender,
                color: 'white',
              },
              '&.highlighted': {
                outline: '3px solid #ffc107',
                outlineOffset: '-3px',
                transform: 'scale(1.05)',
                zIndex: 1,
                position: 'relative',
              },
            },
          },
        ],
      },
    },
  });

  return blackjackTheme;
};

// Theme utility functions
export const getStrategyActionColor = (action: string): string => {
  switch (action.toUpperCase()) {
    case 'H':
    case 'HIT':
      return strategyColors.hit;
    case 'S':
    case 'STAND':
      return strategyColors.stand;
    case 'D':
    case 'DOUBLE':
      return strategyColors.double;
    case 'P':
    case 'SPLIT':
      return strategyColors.split;
    case 'R':
    case 'SURRENDER':
      return strategyColors.surrender;
    default:
      return blackjackColors.neutral;
  }
};

export const getFeedbackColor = (isCorrect: boolean): string => {
  return isCorrect ? blackjackColors.correct : blackjackColors.incorrect;
};

export default createBlackjackTheme;
