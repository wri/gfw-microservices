import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { UploadLocationPreviewErrorMessage } from './UploadLocationPreviewErrorMessage';

describe('UploadLocationPreviewErrorMessage', () => {
  const mockRetryPreviewData = jest.fn();
  const mockRetryUpload = jest.fn();

  afterEach(() => {
    cleanup();
  });

  it('should render missing mandatory fields error message', () => {
    const error = {
      message: 'Validation errors found in the data',
      errors: ['Missing mandatory fields: locationName, analysisRadius, analysisArea'],
    };

    render(
      <UploadLocationPreviewErrorMessage
        error={error}
        keyFile="data.csv"
        onRetryUpload={mockRetryUpload}
        onRetryPreviewData={mockRetryPreviewData}
      />
    );
    screen.logTestingPlaygroundURL();

    expect(
      screen.getByText(
        /your \.csv file is missing the following obligatory fields: location name, analysis radius, analysis area\. please check the required fields in the data templates and update your file before re-uploading it\./i
      )
    ).toBeInTheDocument();
  });

  it('should render invalid file error message', () => {
    const error = {
      message: 'Error',
      errors: ['Error while parsing the data'],
    };

    render(
      <UploadLocationPreviewErrorMessage
        error={error}
        keyFile="data.csv"
        onRetryUpload={mockRetryUpload}
        onRetryPreviewData={mockRetryPreviewData}
      />
    );

    expect(screen.getByText(/invalid file/i)).toBeInTheDocument();
    expect(screen.getByText(/your file is invalid. Please try another one./i)).toBeInTheDocument();
  });

  it('should render platform error message for unknown errors', () => {
    const error = {
      message: 'Error',
      errors: ['Random error'],
    };

    render(
      <UploadLocationPreviewErrorMessage
        error={error}
        keyFile="data.csv"
        onRetryUpload={mockRetryUpload}
        onRetryPreviewData={mockRetryPreviewData}
      />
    );

    expect(screen.getByText(/there were platform issues loading your data/i)).toBeInTheDocument();
  });

  it('should trigger onRetryUpload when retry upload is clicked', async () => {
    const error = {
      message: 'Error',
      errors: ['Error while parsing the data'],
    };

    render(
      <UploadLocationPreviewErrorMessage
        error={error}
        keyFile="data.csv"
        onRetryUpload={mockRetryUpload}
        onRetryPreviewData={mockRetryPreviewData}
      />
    );

    await userEvent.click(screen.getByText(/retry upload/i));
    expect(mockRetryUpload).toHaveBeenCalled();
  });

  it('should trigger onRetryPreviewData when try again button is clicked', async () => {
    render(
      <UploadLocationPreviewErrorMessage
        error={{ message: '', errors: [] }}
        onRetryUpload={mockRetryUpload}
        onRetryPreviewData={mockRetryPreviewData}
      />
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /click here to try again/i,
      })
    );
    expect(mockRetryPreviewData).toHaveBeenCalled();
  });
});
