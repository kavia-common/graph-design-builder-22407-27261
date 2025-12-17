import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Symbols legend title', () => {
  render(<App />);
  const title = screen.getByText(/Symbols/i);
  expect(title).toBeInTheDocument();
});
