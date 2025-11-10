import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';

import AnalysisStatusBanners from './AnalysisStatusBanners';
import { theme } from '../../../../../styles/theme';

describe('AnalysisStatusBanners', () => {
  const defaultProps = {
    isDiagnosticStatusDraft: false,
    hasLocationWithErrors: false,
    openDraftSubmitDialog: jest.fn(),
    toggleReRunAnalysisDialog: jest.fn(),
    isFailedAnalysis: false,
    isAnalysisFailedByExceededAnalysisLimit: false,
    isListSubmittedForAnalysis: false,
  };

  const renderWithTheme = (component) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  it('renders a banner when there are location errors', () => {
    renderWithTheme(
      <AnalysisStatusBanners
        {...defaultProps}
        hasLocationWithErrors={true}
        isFailedAnalysis={false}
        isListWithErrors={false}
      />
    );

    expect(screen.getByText('Location Errors')).toBeInTheDocument();
    expect(
      screen.getByText(
        /some of your locations have failed analysis\. this means that these locations won't be included in list diagnostic calculations\./i
      )
    ).toBeInTheDocument();
  });

  it('renders a banner for failed analysis', () => {
    renderWithTheme(
      <AnalysisStatusBanners
        {...defaultProps}
        isFailedAnalysis={true}
        isAnalysisFailedByExceededAnalysisLimit={false}
      />
    );

    expect(screen.getByText('Analysis has failed')).toBeInTheDocument();
    expect(
      screen.getByText(
        /your list has failed analysis\. read more about how to avoid and address analysis failures \./i
      )
    ).toBeInTheDocument();

    const links = screen.getAllByRole('link', { name: 'here' });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute(
      'href',
      'https://globalforestwatch.org/help/gfw-pro/guides/how-to-address-errors-in-your-uploads'
    );
  });

  it('renders a banner for usage limit exceeded', () => {
    renderWithTheme(
      <AnalysisStatusBanners {...defaultProps} isAnalysisFailedByExceededAnalysisLimit={true} />
    );

    expect(screen.getByText('Usage limit exceeded')).toBeInTheDocument();
  });

  it('renders a banner for draft state', () => {
    renderWithTheme(
      <AnalysisStatusBanners
        {...defaultProps}
        isDiagnosticStatusDraft={true}
        isListSubmittedForAnalysis={false}
      />
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your list is currently in Draft state. To view data for your list, please submit for analysis.'
      )
    ).toBeInTheDocument();
  });

  it('calls the correct function when a button is clicked', async () => {
    const openDraftSubmitDialog = jest.fn();

    renderWithTheme(
      <AnalysisStatusBanners
        {...defaultProps}
        isDiagnosticStatusDraft={true}
        isListSubmittedForAnalysis={false}
        openDraftSubmitDialog={openDraftSubmitDialog}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByText('Submit Again'));

    expect(openDraftSubmitDialog).toHaveBeenCalledTimes(1);
  });

  it('renders a banner when there is error in list level', () => {
    renderWithTheme(
      <AnalysisStatusBanners
        {...defaultProps}
        hasLocationWithErrors={false}
        isFailedAnalysis={false}
        isListWithErrors={true}
        isDiagnosticStatusDraft={true}
      />
    );

    expect(screen.getByText('Draft - Location Errors Detected')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This list is in Draft because it includes locations with errors. Location errors can be corrected offline and re-added to your list. See more detailed instructions below.'
      )
    ).toBeInTheDocument();
  });

  it('renders no banners if no conditions are met', () => {
    renderWithTheme(<AnalysisStatusBanners {...defaultProps} />);

    expect(screen.queryByTestId('alert-banner')).not.toBeInTheDocument();
  });
});
