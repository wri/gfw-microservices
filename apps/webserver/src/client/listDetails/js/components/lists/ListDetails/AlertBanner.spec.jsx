import { render, screen } from '@testing-library/react';
import AlertBanner from './AlertBanner';
import userEvent from '@testing-library/user-event';

describe('AlertBanner', () => {
  const props = {
    title: 'Test Alert',
    backgroundColor: '#ff0000',
    icon: <span data-testid="alert-icon">!</span>,
    message: 'This is a test message',
    buttonText: 'Dismiss',
    onButtonClick: jest.fn(),
  };

  const mockProps = {
    title: 'Test Title',
    backgroundColor: '#ff0000',
    icon: <span data-testid="icon">Icon</span>,
    message: 'This is a test message.',
    buttonText: 'Click Me',
    onButtonClick: jest.fn(),
  };

  it('renders the alert banner with the correct props', () => {
    render(<AlertBanner {...props} />);

    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(props.message)).toBeInTheDocument();
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: props.buttonText })).toBeInTheDocument();
  });

  it('calls onButtonClick when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<AlertBanner {...props} />);
    const button = screen.getByRole('button', { name: props.buttonText });
    await user.click(button);
    expect(props.onButtonClick).toHaveBeenCalledTimes(1);
  });

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
});
