import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { UploadLocationPreviewErrorMessage } from './UploadLocationPreviewErrorMessage';
import { UploadLocationProvider } from '../contexts/UploadLocationContext';

describe('UploadLocationPreviewErrorMessage', () => {
  const mockRetryPreviewData = jest.fn();
  const mockRetryUpload = jest.fn();

  it('should render missing mandatory fields error message', () => {
    const error = {
      message: 'Validation errors found in the data',
      errors: ['Missing mandatory fields: locationName, analysisRadius, analysisArea'],
    };

    render(
      <UploadLocationProvider>
        <UploadLocationPreviewErrorMessage
          error={error}
          keyFile="data.csv"
          onRetryUpload={mockRetryUpload}
          onRetryPreviewData={mockRetryPreviewData}
        />
      </UploadLocationProvider>
    );

    expect(
      screen.getByText(
        /your \.csv file is missing the following obligatory fields: location name, analysis radius, analysis area\. please check the required fields in the data templates and update your file before re-uploading it\./i
      )
    ).toBeInTheDocument();
  });

  it('should render invalid coordinates error message', () => {
    const error = {
      errors: [
        'Invalid latitude or longitude: undefined, undefined',
        'Missing mandatory fields: latitude, longitude',
      ],
    };

    render(
      <UploadLocationProvider>
        <UploadLocationPreviewErrorMessage
          error={error}
          keyFile="data.csv"
          onRetryUpload={mockRetryUpload}
          onRetryPreviewData={mockRetryPreviewData}
        />
      </UploadLocationProvider>
    );

    expect(screen.getByText(/invalid file/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid latitude or longitude/i)).toBeInTheDocument();
  });

  it('should render invalid file error message', () => {
    const error = {
      errors: ['Error while parsing the data'],
    };

    render(
      <UploadLocationProvider>
        <UploadLocationPreviewErrorMessage
          error={error}
          keyFile="data.csv"
          onRetryUpload={mockRetryUpload}
          onRetryPreviewData={mockRetryPreviewData}
        />
      </UploadLocationProvider>
    );

    expect(screen.getByText(/invalid file/i)).toBeInTheDocument();
    expect(screen.getByText(/your file is invalid. Please try another one./i)).toBeInTheDocument();
  });

  it('should render empty file error message', () => {
    const error = {
      errors: ['Empty data file'],
    };

    render(
      <UploadLocationProvider>
        <UploadLocationPreviewErrorMessage
          error={error}
          keyFile="data.csv"
          onRetryUpload={mockRetryUpload}
          onRetryPreviewData={mockRetryPreviewData}
        />
      </UploadLocationProvider>
    );

    expect(screen.getByText(/empty data file/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Your data file is empty. Please ensure your data file contains at least one location before re-uploading./i
      )
    ).toBeInTheDocument();
  });

  it('should render UML ID error message', () => {
    const error = {
      errors: ['UML LookUp: did not found lat/long for some-id'],
    };

    render(
      <UploadLocationProvider>
        <UploadLocationPreviewErrorMessage
          error={error}
          keyFile="data.csv"
          onRetryUpload={mockRetryUpload}
          onRetryPreviewData={mockRetryPreviewData}
        />
      </UploadLocationProvider>
    );

    expect(screen.getByText(/invalid file/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /your location does not have a valid UML ID. Please ensure the ID data you entered exists in the Universal Mill List./i
      )
    ).toBeInTheDocument();
  });

  it('should render platform error message for unknown errors', () => {
    const error = {
      errors: ['Random error'],
    };

    render(
      <UploadLocationProvider>
        <UploadLocationPreviewErrorMessage
          error={error}
          keyFile="data.csv"
          onRetryUpload={mockRetryUpload}
          onRetryPreviewData={mockRetryPreviewData}
        />
      </UploadLocationProvider>
    );

    expect(screen.getByText(/there were platform issues loading your data/i)).toBeInTheDocument();
  });

  it('should trigger onRetryUpload when retry upload is clicked', async () => {
    const error = {
      errors: ['Error while parsing the data'],
    };

    render(
      <UploadLocationProvider>
        <UploadLocationPreviewErrorMessage
          error={error}
          keyFile="data.csv"
          onRetryUpload={mockRetryUpload}
          onRetryPreviewData={mockRetryPreviewData}
        />
      </UploadLocationProvider>
    );

    await userEvent.click(screen.getByText(/retry upload/i));
    expect(mockRetryUpload).toHaveBeenCalled();
  });

  it('should trigger onRetryPreviewData when try again button is clicked', async () => {
    render(
      <UploadLocationProvider>
        <UploadLocationPreviewErrorMessage
          error={{ errors: [] }}
          onRetryUpload={mockRetryUpload}
          onRetryPreviewData={mockRetryPreviewData}
        />
      </UploadLocationProvider>
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /click here to try again/i,
      })
    );
    expect(mockRetryPreviewData).toHaveBeenCalled();
  });

  it('should render CAR LookUp error message', () => {
    const error = {
      errors: ['CAR LookUp: did not found lat/long for some-id'],
    };

    render(
      <UploadLocationProvider>
        <UploadLocationPreviewErrorMessage
          error={error}
          keyFile="data.csv"
          onRetryUpload={mockRetryUpload}
          onRetryPreviewData={mockRetryPreviewData}
        />
      </UploadLocationProvider>
    );

    expect(screen.getByText(/invalid file/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /The defined ID is not recognized by GFW Pro. Please enter a recognized ID system value./i
      )
    ).toBeInTheDocument();
  });
});
