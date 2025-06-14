import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => { // This test will likely fail as "learn react" is not present
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
