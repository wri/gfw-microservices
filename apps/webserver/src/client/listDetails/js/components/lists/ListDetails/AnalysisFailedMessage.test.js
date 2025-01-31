import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AnalysisFailedMessage from './AnalysisFailedMessage';

describe('AnalysisFailedMessage', () => {
  afterEach(cleanup);
  it('renders the error icon, title, message, and support link', () => {
    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={jest.fn()} />);

    expect(screen.getByText('Analysis has failed')).toBeInTheDocument();
    expect(
      screen.getByText('To receive results, resubmit this list for analysis.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /gfwprosupport@wri.org/i })).toHaveAttribute(
      'href',
      'mailto:gfwprosupport@wri.org'
    );
  });

  it('calls toggleReRunAnalysisDialog when the "TRY AGAIN" button is clicked', () => {
    const mockToggle = jest.fn();
    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={mockToggle} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
