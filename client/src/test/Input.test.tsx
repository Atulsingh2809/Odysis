import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '../components/ui/Input';

describe('Input component', () => {
  it('renders input with label and placeholder', () => {
    render(<Input label="Email Address" placeholder="test@example.com" />);
    expect(screen.getByLabelText(/email address/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/test@example.com/i)).toBeDefined();
  });

  it('displays error message when provided', () => {
    render(<Input label="Password" error="Invalid password" />);
    expect(screen.getByText(/invalid password/i)).toBeDefined();
  });
});
