import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalysisFailedMessage from './AnalysisFailedMessage';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('AnalysisFailedMessage Component', () => {
  const mockToggleReRunAnalysisDialog = jest.fn();

  it('renders the error icon, title, message, and support link', () => {
    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={jest.fn()} />);

    expect(screen.getByText('Analysis has failed')).toBeInTheDocument();
    expect(
      screen.getByText('To receive results, resubmit this list for analysis.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GFW Pro support here/i })).toHaveAttribute(
      'href',
      'https://gfwpro.zendesk.com/hc/en-us/requests/new'
    );
  });

  it('calls toggleReRunAnalysisDialog when the "TRY AGAIN" button is clicked', () => {
    const mockToggle = jest.fn();
    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={mockToggle} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('renders the component with correct elements', () => {
    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={mockToggleReRunAnalysisDialog} />);

    expect(screen.getByTestId('ReportGmailerrorredIcon')).toBeInTheDocument();

    expect(screen.getByText('Analysis has failed')).toBeInTheDocument();
    expect(
      screen.getByText('To receive results, resubmit this list for analysis.')
    ).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'TRY AGAIN' });
    expect(button).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /GFW Pro support here/i })).toHaveAttribute(
      'href',
      'https://gfwpro.zendesk.com/hc/en-us/requests/new'
    );
  });

  it('calls toggleReRunAnalysisDialog when the button is clicked', async () => {
    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={mockToggleReRunAnalysisDialog} />);

    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: 'TRY AGAIN' });

    // Simulate clicking the button
    await user.click(button);

    // Verify function call
    expect(mockToggleReRunAnalysisDialog).toHaveBeenCalledTimes(1);
  });
});
