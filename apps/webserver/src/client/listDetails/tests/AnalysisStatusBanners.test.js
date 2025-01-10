import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import AnalysisStatusBanners from '../js/components/lists/ListDetails/AnalysisStatusBanners';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

jest.mock('../js/components/lists/ListDetails/AlertBanner', () => (props) => (
  <div data-testid="alert-banner">
    <span>{props.title}</span>
    <span>{props.message}</span>
    <button onClick={props.onButtonClick}>{props.buttonText}</button>
  </div>
));

describe('AnalysisStatusBanners Component', () => {
  const defaultProps = {
    isDiagnosticStatusDraft: false,
    hasLocationWithErrors: false,
    openDraftSubmitDialog: jest.fn(),
    toggleReRunAnalysisDialog: jest.fn(),
    isFailedAnalysis: false,
    isAnalysisFailedByExceededAnalysisLimit: false,
    isListSubmittedForAnalysis: false,
  };

  test('renders a banner when there are location errors', () => {
    render(
      <AnalysisStatusBanners
        {...defaultProps}
        hasLocationWithErrors={true}
        isFailedAnalysis={false}
      />
    );

    expect(screen.getByText('Location errors')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Some of your locations have failed analysis. This means that these locations won’t be included in list diagnostic calculations.'
      )
    ).toBeInTheDocument();
  });

  test('renders a banner for failed analysis', () => {
    render(<AnalysisStatusBanners {...defaultProps} isFailedAnalysis={true} />);

    expect(screen.getByText('Analysis has failed')).toBeInTheDocument();
    expect(
      screen.getByText('To receive results, resubmit this list for analysis.')
    ).toBeInTheDocument();
  });

  test('renders a banner for usage limit exceeded', () => {
    render(
      <AnalysisStatusBanners {...defaultProps} isAnalysisFailedByExceededAnalysisLimit={true} />
    );

    expect(screen.getByText('Usage limit exceeded')).toBeInTheDocument();
    expect(screen.getByText('Usage limit exceeded')).toBeInTheDocument();
  });

  test('renders a banner for draft state', () => {
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

  test('calls the correct function when a button is clicked', () => {
    const openDraftSubmitDialog = jest.fn();

    render(
      <AnalysisStatusBanners
        {...defaultProps}
        isDiagnosticStatusDraft={true}
        isListSubmittedForAnalysis={false}
        openDraftSubmitDialog={openDraftSubmitDialog}
      />
    );

    fireEvent.click(screen.getByText('Submit for Analysis'));

    expect(openDraftSubmitDialog).toHaveBeenCalled();
  });

  test('renders no banners if no conditions are met', () => {
    render(<AnalysisStatusBanners {...defaultProps} />);

    expect(screen.queryByTestId('alert-banner')).not.toBeInTheDocument();
  });
});
