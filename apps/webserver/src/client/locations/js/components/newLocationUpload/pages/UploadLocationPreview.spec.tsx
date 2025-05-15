import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadLocationPreview } from './UploadLocationPreview';
import { useUploadLocation } from '../contexts';
import { useFetch } from '../../../../../hooks';
import { uploadFileToS3 } from '../utils/upload';
import { getFileExtension } from '../../../../../utils';
import { UploadType } from '../types';

jest.mock('../contexts', () => ({
  useUploadLocation: jest.fn(),
}));

jest.mock('../utils/upload', () => ({
  ...jest.requireActual('../utils/upload'),
  uploadFileToS3: jest.fn(),
  getTableColumns: () => [],
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Skeleton: () => <span data-testid="skeleton" />,
}));

jest.mock('../../../../../utils');

const mockHistoryGoBack = jest.fn();
const mockHistoryPush = jest.fn();
jest.mock('../hooks', () => ({
  useHistory: () => ({ goBack: mockHistoryGoBack, push: mockHistoryPush }),
}));

let mockUploadLocationPreviewErrorMessage: jest.Mock;

jest.mock('../components', () => {
  mockUploadLocationPreviewErrorMessage = jest.fn(() => (
    <span data-testid="upload-error-message" />
  ));
  return {
    NavBar: () => <span />,
    UploadLocationPreviewErrorMessage: mockUploadLocationPreviewErrorMessage,
  };
});

jest.mock('../../../../../hooks', () => ({
  useFetch: jest.fn(),
}));

describe('UploadLocationPreview', () => {
  const mockUseUploadLocation = {
    uploadLocationState: { uploadedFileUrl: 'test.csv', uploadType: UploadType.ByFile },
    clearUploadType: jest.fn(),
    addFile: jest.fn(),
  };

  beforeEach(() => {
    (useUploadLocation as jest.Mock).mockReturnValue(mockUseUploadLocation);
    (useFetch as jest.Mock).mockReturnValue({
      data: { features: [] },
      isLoading: false,
      request: jest.fn(),
      error: null,
    });
  });

  afterEach(cleanup);

  it('should render the component correctly', () => {
    render(<UploadLocationPreview />);
    expect(screen.getByText(/list Preview/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /this is a preview of the first 10 rows of data in your location file\. please review to ensure that fields and data format look as you expect\. if you see any issues, please check \/ correct your file and re-upload\./i
      )
    ).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    jest
      .mocked(uploadFileToS3)
      .mockResolvedValue({ keyFile: 'file', fileS3Route: 'fileS3Route', url: 'url' });

    render(<UploadLocationPreview />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });

    await userEvent.upload(fileInput, file);

    expect(mockUseUploadLocation.addFile).toHaveBeenCalledWith({
      fileS3Route: 'fileS3Route',
      keyFile: 'file',
      url: 'url',
    });
    expect(screen.queryByTestId('upload-error-message')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(mockHistoryPush).toHaveBeenCalledWith('CONFIGURE_LIST');
  });

  it('should display error message when upload fails', async () => {
    (useFetch as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      request: jest.fn(),
      error: {
        errors: ['Missing mandatory fields: locationName, analysisRadius, analysisArea'],
      },
    });
    (getFileExtension as jest.Mock).mockReturnValue('.zip');

    render(<UploadLocationPreview />);

    const lastCallArgs = mockUploadLocationPreviewErrorMessage.mock.calls.at(-1)?.[0];
    expect(lastCallArgs).toEqual(
      expect.objectContaining({
        error: { errors: ['Missing mandatory fields: locationName, analysisRadius, analysisArea'] },
      })
    );

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('should navigate back when Back button is clicked', async () => {
    render(<UploadLocationPreview />);
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(mockHistoryGoBack).toHaveBeenCalled();
  });

  it('should clear upload type when Cancel button is clicked', async () => {
    render(<UploadLocationPreview />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockUseUploadLocation.clearUploadType).toHaveBeenCalled();
  });

  it('should render skeleton when its loading', () => {
    (useFetch as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      request: jest.fn(),
      error: null,
    });
    (getFileExtension as jest.Mock).mockReturnValue('.zip');
    render(<UploadLocationPreview />);

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should pass the empty data file error to <UploadLocationPreviewErrorMessage />', () => {
    (useFetch as jest.Mock).mockReturnValue({
      data: { features: [] },
      isLoading: false,
      request: jest.fn(),
      error: null,
    });

    render(<UploadLocationPreview />);

    const lastCallArgs = mockUploadLocationPreviewErrorMessage.mock.calls.at(-1)?.[0];
    expect(lastCallArgs).toEqual(
      expect.objectContaining({
        error: { errors: ['Empty data file'] },
      })
    );

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
