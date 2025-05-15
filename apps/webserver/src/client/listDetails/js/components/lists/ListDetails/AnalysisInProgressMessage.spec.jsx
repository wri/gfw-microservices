import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisInProgressMessage from './AnalysisInProgressMessage';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('AnalysisInProgressMessage', () => {
  it('renders the component with correct elements', () => {
    render(<AnalysisInProgressMessage />);

    // Verifies that the CircularProgress is present
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Verifies the main heading text
    expect(screen.getByText('In Analysis!')).toBeInTheDocument();

    // Verifies the body message
    expect(
      screen.getByText(
        'List is analyzing. You will receive an email once analysis is complete and can reload the page to access the results.'
      )
    ).toBeInTheDocument();
  });
});
