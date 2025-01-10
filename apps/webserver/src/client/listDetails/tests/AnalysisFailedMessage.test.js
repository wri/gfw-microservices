import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalysisFailedMessage from '../js/components/lists/ListDetails/AnalysisFailedMessage';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('AnalysisFailedMessage Component', () => {
  const mockToggleReRunAnalysisDialog = jest.fn();

  test('renders the component with correct elements', () => {
    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={mockToggleReRunAnalysisDialog} />);

    // Verify icon is present
    expect(screen.getByTestId('ReportGmailerrorredIcon')).toBeInTheDocument();

    // Verify text content
    expect(screen.getByText('Analysis has failed')).toBeInTheDocument();
    expect(
      screen.getByText('To receive results, resubmit this list for analysis.')
    ).toBeInTheDocument();

    // Verify button
    const button = screen.getByRole('button', { name: 'TRY AGAIN' });
    expect(button).toBeInTheDocument();

    // Verify email link
    expect(screen.getByText('gfwprosupport@wri.org')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'gfwprosupport@wri.org' })).toHaveAttribute(
      'href',
      'mailto:gfwprosupport@wri.org'
    );
  });

  test('calls toggleReRunAnalysisDialog when the button is clicked', async () => {
    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={mockToggleReRunAnalysisDialog} />);

    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: 'TRY AGAIN' });

    // Simulate clicking the button
    await user.click(button);

    // Verify function call
    expect(mockToggleReRunAnalysisDialog).toHaveBeenCalledTimes(1);
  });
});
