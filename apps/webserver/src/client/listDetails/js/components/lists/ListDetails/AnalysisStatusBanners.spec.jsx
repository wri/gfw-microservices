import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnalysisStatusBanners from './AnalysisStatusBanners';

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

  it('renders a banner when there are location errors', () => {
    render(
      <AnalysisStatusBanners
        {...defaultProps}
        hasLocationWithErrors={true}
        isFailedAnalysis={false}
        isListWithErrors={false}
      />
    );

    expect(screen.getByText('Location errors')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Some of your locations have failed analysis. This means that these locations won't be included in list diagnostic calculations."
      )
    ).toBeInTheDocument();
  });

  it('renders a banner for failed analysis', () => {
    render(
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
    render(
      <AnalysisStatusBanners {...defaultProps} isAnalysisFailedByExceededAnalysisLimit={true} />
    );

    expect(screen.getByText('Usage limit exceeded')).toBeInTheDocument();
  });

  it('renders a banner for draft state', () => {
    render(
      <AnalysisStatusBanners
        {...defaultProps}
        isDiagnosticStatusDraft={true}
        isListSubmittedForAnalysis={false}
      />
    );

    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your list is currently in Draft state. To view data for your list, please submit for analysis.'
      )
    ).toBeInTheDocument();
  });

  it('calls the correct function when a button is clicked', async () => {
    const openDraftSubmitDialog = jest.fn();

    render(
      <AnalysisStatusBanners
        {...defaultProps}
        isDiagnosticStatusDraft={true}
        isListSubmittedForAnalysis={false}
        openDraftSubmitDialog={openDraftSubmitDialog}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByText('Submit for Analysis'));

    expect(openDraftSubmitDialog).toHaveBeenCalledTimes(1);
  });

  it('renders a banner when there is error in list level', () => {
    render(
      <AnalysisStatusBanners
        {...defaultProps}
        hasLocationWithErrors={true}
        isFailedAnalysis={false}
        isListWithErrors={true}
        isDiagnosticStatusDraft={true}
      />
    );

    expect(screen.getByText('Location errors')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This list is in Draft because it includes locations with errors. Location errors can be corrected offline and re-added to your list. See more detailed instructions below.'
      )
    ).toBeInTheDocument();
  });

  it('renders no banners if no conditions are met', () => {
    render(<AnalysisStatusBanners {...defaultProps} />);

    expect(screen.queryByTestId('alert-banner')).not.toBeInTheDocument();
  });
});
