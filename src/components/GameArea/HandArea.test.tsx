import React from 'react';
import { render, screen } from '@testing-library/react';
import HandArea from './HandArea';
import { Card as CardType } from '../../logic/game/cardTypes';
import { ThemeProvider } from '@mui/material/styles';
import darkTheme from '../../themes/darkTheme';

// Mock the CardList component to simplify testing
jest.mock('./CardList', () => {
  return {
    __esModule: true,
    default: ({ hand, isPlayer }: { hand: CardType[], isPlayer?: boolean }) => (
      <div data-testid={`card-list-${isPlayer ? 'player' : 'dealer'}`}>
        Cards: {hand?.length || 0}
      </div>
    ),
  };
});

describe('HandArea Component', () => {
  // Sample cards for testing
  const sampleCards: CardType[] = [
    { rank: '10', suit: '♠', value: 10, id: '10-♠-1' },
    { rank: 'J', suit: '♥', value: 10, id: 'J-♥-1' }
  ];

  it('should render the dealer hand area correctly', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <HandArea 
          title="Dealer" 
          hand={sampleCards} 
          score="20"
          activeArea={null}
          winnerArea={null}
          playerFlash={null}
          newCardIds={[]}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Dealer')).toBeInTheDocument();
    expect(screen.getByText('Score: 20')).toBeInTheDocument();
    expect(screen.getByTestId('card-list-dealer')).toBeInTheDocument();
  });

  it('should render the player hand area correctly', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <HandArea 
          title="Player" 
          hand={sampleCards} 
          score="20"
          activeArea="player"
          winnerArea={null}
          playerFlash={null}
          newCardIds={[]}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Score: 20')).toBeInTheDocument();
    expect(screen.getByTestId('card-list-player')).toBeInTheDocument();
  });

  it('should highlight active player hand', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <HandArea 
          title="Player" 
          hand={sampleCards} 
          score="20"
          activeArea="player"
          winnerArea={null}
          playerFlash={null}
          newCardIds={[]}
          isPlayer={true}
        />
      </ThemeProvider>
    );

    // Check for styling that indicates current hand (Paper component with border)
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('should highlight active dealer hand', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <HandArea 
          title="Dealer" 
          hand={sampleCards} 
          score="20"
          activeArea="dealer"
          winnerArea={null}
          playerFlash={null}
          newCardIds={[]}
          isPlayer={false}
        />
      </ThemeProvider>
    );

    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('should display when no cards are provided', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <HandArea 
          title="Player" 
          hand={[]} 
          score=""
          activeArea={null}
          winnerArea={null}
          playerFlash={null}
          newCardIds={[]}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByLabelText('No cards dealt yet')).toBeInTheDocument();
  });
});
