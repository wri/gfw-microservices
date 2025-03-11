import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AlertBanner from './AlertBanner';

afterEach(cleanup);
describe('AlertBanner', () => {
  const props = {
    title: 'Test Alert',
    backgroundColor: 'red',
    icon: <span data-testid="alert-icon">!</span>,
    message: 'This is a test message',
    buttonText: 'Dismiss',
    onButtonClick: jest.fn(),
  };

  it('renders the alert banner with the correct props', () => {
    render(<AlertBanner {...props} />);

    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(props.message)).toBeInTheDocument();
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: props.buttonText })).toBeInTheDocument();
  });

  it('calls onButtonClick when the button is clicked', () => {
    render(<AlertBanner {...props} />);
    const button = screen.getByRole('button', { name: props.buttonText });
    fireEvent.click(button);
    expect(props.onButtonClick).toHaveBeenCalledTimes(1);
  });
});
