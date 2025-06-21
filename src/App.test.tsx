import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Blackjack Trainer app', () => {
  render(<App />);

  // Check for header title specifically (not the game area title)
  const titleElements = screen.getAllByText(/blackjack trainer/i);
  expect(titleElements.length).toBeGreaterThan(0);

  // Check for theme toggle button
  const themeToggle = screen.getByLabelText(/switch to dark mode/i);
  expect(themeToggle).toBeInTheDocument();

  // Check for strategy guide button
  const strategyGuide = screen.getByLabelText(/strategy guide/i);
  expect(strategyGuide).toBeInTheDocument();
});
