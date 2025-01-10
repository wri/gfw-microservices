import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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

    expect(screen.getByTestId('ReportGmailerrorredIcon')).toBeInTheDocument();

    expect(screen.getByText('Analysis has failed')).toBeInTheDocument();

    expect(
      screen.getByText('To receive results, resubmit this list for analysis.')
    ).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'TRY AGAIN' });
    expect(button).toBeInTheDocument();

    expect(screen.getByText('gfwprosupport@wri.org')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'gfwprosupport@wri.org' })).toHaveAttribute(
      'href',
      'mailto:gfwprosupport@wri.org'
    );
  });

  test('calls toggleReRunAnalysisDialog when the button is clicked', () => {
    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={mockToggleReRunAnalysisDialog} />);

    const button = screen.getByRole('button', { name: 'TRY AGAIN' });
    fireEvent.click(button);

    expect(mockToggleReRunAnalysisDialog).toHaveBeenCalledTimes(1);
  });
});
