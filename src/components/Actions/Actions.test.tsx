import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Actions from './Actions';
import { BlackjackProvider } from '../../context/BlackjackContext';
import { ThemeProvider } from '@mui/material/styles';
import darkTheme from '../../themes/darkTheme';

// Mock the Blackjack context
const mockNewGameHandler = jest.fn();
const mockHitHandler = jest.fn();
const mockStandHandler = jest.fn();
const mockDoubleHandler = jest.fn();
const mockSplitHandler = jest.fn();
const mockSurrenderHandler = jest.fn();
const mockShowHistoryHandler = jest.fn();

const mockBlackjackContext = {
  newGameHandler: mockNewGameHandler,
  hitHandler: mockHitHandler,
  standHandler: mockStandHandler,
  doubleHandler: mockDoubleHandler,
  splitHandler: mockSplitHandler,
  surrenderHandler: mockSurrenderHandler,
  showHistoryHandler: mockShowHistoryHandler,
  playerCanHit: true,
  playerCanStand: true,
  playerCanDouble: true,
  playerCanSplit: false,
  playerCanSurrender: true,
};

jest.mock('../../context/BlackjackContext', () => ({
  __esModule: true,
  BlackjackProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useBlackjack: () => mockBlackjackContext,
}));

describe('Actions Component', () => {
  const setup = (overrideProps = {}) => {
    // Override any props with test-specific values
    Object.assign(mockBlackjackContext, overrideProps);
    
    return render(
      <ThemeProvider theme={darkTheme}>
        <BlackjackProvider>
          <Actions />
        </BlackjackProvider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Reset context to default values
    Object.assign(mockBlackjackContext, {
      playerCanHit: true,
      playerCanStand: true,
      playerCanDouble: true,
      playerCanSplit: false,
      playerCanSurrender: true,
    });
  });

  it('renders all action buttons correctly', () => {
    setup();
    
    expect(screen.getByRole('button', { name: /hit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stand/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /double/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /surrender/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument();
  });

  it('disables the Split button when player cannot split', () => {
    setup({ playerCanSplit: false });
    
    const splitButton = screen.getByRole('button', { name: /split/i });
    expect(splitButton).toBeDisabled();
  });
  
  it('enables the Split button when player can split', () => {
    setup({ playerCanSplit: true });
    
    const splitButton = screen.getByRole('button', { name: /split/i });
    expect(splitButton).not.toBeDisabled();
  });

  it('calls the correct handler when Hit button is clicked', () => {
    setup();
    
    const hitButton = screen.getByRole('button', { name: /hit/i });
    fireEvent.click(hitButton);
    
    expect(mockHitHandler).toHaveBeenCalled();
  });

  it('calls the correct handler when Stand button is clicked', () => {
    setup();
    
    const standButton = screen.getByRole('button', { name: /stand/i });
    fireEvent.click(standButton);
    
    expect(mockStandHandler).toHaveBeenCalled();
  });

  it('calls the correct handler when Double button is clicked', () => {
    setup();
    
    const doubleButton = screen.getByRole('button', { name: /double/i });
    fireEvent.click(doubleButton);
    
    expect(mockDoubleHandler).toHaveBeenCalled();
  });

  it('disables game action buttons correctly', () => {
    setup({
      playerCanHit: false,
      playerCanStand: false,
      playerCanDouble: false,
      playerCanSurrender: false
    });
    
    expect(screen.getByRole('button', { name: /hit/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /stand/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /double/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /surrender/i })).toBeDisabled();
  });
});