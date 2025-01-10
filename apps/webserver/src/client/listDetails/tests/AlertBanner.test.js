import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AlertBanner from '../js/components/lists/ListDetails/AlertBanner';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('AlertBanner', () => {
  const mockProps = {
    title: 'Test Title',
    backgroundColor: '#ff0000',
    icon: <span data-testid="icon">Icon</span>,
    message: 'This is a test message.',
    buttonText: 'Click Me',
    onButtonClick: jest.fn(),
  };

  it('renders the component with the correct title, message, and button text', () => {
    render(<AlertBanner {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.message)).toBeInTheDocument();
    expect(screen.getByText(mockProps.buttonText)).toBeInTheDocument();
  });

  it('renders the icon inside the alert', () => {
    render(<AlertBanner {...mockProps} />);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('applies the correct background color', () => {
    render(<AlertBanner {...mockProps} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle(`background-color: ${mockProps.backgroundColor}`);
  });

  it('handles the button click event', async () => {
    const user = userEvent.setup();
    render(<AlertBanner {...mockProps} />);

    const button = screen.getByRole('button', { name: mockProps.buttonText });
    await user.click(button);
    expect(mockProps.onButtonClick).toHaveBeenCalledTimes(1);
  });

  it('renders the correct severity of the alert', () => {
    render(<AlertBanner {...mockProps} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardError');
  });
});
