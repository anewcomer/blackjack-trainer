import React from 'react';
import { render, screen } from '@testing-library/react';
import CardComponent from './Card';
import { ThemeProvider } from '@mui/material/styles';
import darkTheme from '../../themes/darkTheme';

jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, whileHover, initial, animate, variants, custom, transition, ...props }: any) => <div {...props}>{children}</div>,
    },
  };
});

describe('Card Component', () => {
  const cardMock = {
    rank: 'A',
    suit: '♥',
    value: 11,
    id: 'A-♥-1',
  };

  test('renders a card with correct content', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <CardComponent card={cardMock} />
      </ThemeProvider>
    );
    
    // Check for rank and suit
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('♥')).toBeInTheDocument();
    
    // Check that it has appropriate aria-label for accessibility
    const cardElement = screen.getByRole('img', { name: /ace of hearts/i });
    expect(cardElement).toBeInTheDocument();
  });

  test('renders a hidden card', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <CardComponent card={cardMock} hidden={true} />
      </ThemeProvider>
    );
    
    // Hidden card should not show the actual rank and suit
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.queryByText('♥')).not.toBeInTheDocument();
    
    // It should have an appropriate aria-label for a hidden card
    const cardElement = screen.getByRole('img', { name: /face down card/i });
    expect(cardElement).toBeInTheDocument();
  });

  test('renders an empty card slot when no card provided', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <CardComponent />
      </ThemeProvider>
    );
    
    // Empty card slot should have appropriate styling and accessibility
    const emptySlot = screen.getByRole('presentation', { hidden: true });
    expect(emptySlot).toBeInTheDocument();
  });

  test('applies "isNew" styling when specified', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <CardComponent card={cardMock} isNew={true} />
      </ThemeProvider>
    );
    
    // Check that card has appropriate class/styling for a newly dealt card
    // Note: Since we mocked framer-motion, we can't test the animation directly
    // but we can check that the card content is still rendered correctly
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('♥')).toBeInTheDocument();
  });
});
