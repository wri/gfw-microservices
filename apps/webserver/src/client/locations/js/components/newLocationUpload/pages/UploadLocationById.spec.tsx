import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadLocationById } from './UploadLocationById';
import { useUploadLocation } from '../contexts';
import { uploadFileToS3 } from '../utils/upload';
import { ThemeProvider } from '../../../../../styles/ThemeProvider';

jest.mock('../components', () => ({
  DataTemplates: () => <span />,
  NavBar: () => <span />,
  UploadByFileFolderIcon: () => <span />,
  UploadByFileInstructions: () => <span />,
}));

jest.mock('../../../../../components', () => {
  const { PillButton } = jest.requireActual('../../../../../components');
  return {
    PillButton,
  };
});

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Modal: () => <span />,
}));

jest.mock('../contexts', () => ({
  useUploadLocation: jest.fn(),
}));

jest.mock('../utils/upload', () => ({
  uploadFileToS3: jest.fn(),
}));

const mockHistoryPush = jest.fn();
jest.mock('../hooks', () => ({
  useHistory: () => ({ push: mockHistoryPush }),
}));

describe('UploadLocationById', () => {
  const mockAddFile = jest.fn();
  const mockClearUploadType = jest.fn();

  beforeEach(() => {
    (useUploadLocation as jest.Mock).mockReturnValue({
      addFile: mockAddFile,
      clearUploadType: mockClearUploadType,
    });
  });

  it('should render the component correctly', () => {
    render(
      <ThemeProvider>
        <UploadLocationById />
      </ThemeProvider>
    );
    expect(
      screen.getByRole('heading', {
        name: /by id: prepare & upload location data/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /prepare your data in a format accepted by gfw pro to upload your id\(s\) system based\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /how to prepare your data/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /before uploading your data, it must be formatted according to a gfw pro template\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /data files must be formatted according to gfw pro requirements - click "data templates" above to learn more\./i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/csv or excel files/i)).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('should handle file upload success', async () => {
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
    jest.mocked(uploadFileToS3).mockResolvedValue({
      keyFile: 'https://example.com/test.csv',
      fileS3Route: 'fileS3Route',
      url: 'url',
    });

    render(
      <ThemeProvider>
        <UploadLocationById />
      </ThemeProvider>
    );

    const dropzone = screen.getByRole('form');
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(uploadFileToS3).toHaveBeenCalledWith(file);
      expect(mockAddFile).toHaveBeenCalledWith({
        keyFile: 'https://example.com/test.csv',
        fileS3Route: 'fileS3Route',
        url: 'url',
      });
    });
  });

  it('should display an error message for unsupported file types', async () => {
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });

    render(
      <ThemeProvider>
        <UploadLocationById />
      </ThemeProvider>
    );

    const dropzone = screen.getByRole('form');
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    expect(
      screen.getByText(
        /it looks like the file you uploaded is not supported for id-based upload\. id-based upload requires a/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload again/i })).toBeInTheDocument();
  });

  it('should allow re-uploading after failure', async () => {
    (uploadFileToS3 as jest.Mock).mockRejectedValue(new Error('Upload failed'));
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });

    render(
      <ThemeProvider>
        <UploadLocationById />
      </ThemeProvider>
    );

    const dropzone = screen.getByRole('form');
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('Upload again')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeDisabled();
    });
  });

  it('should navigate to preview page when file upload is successful', async () => {
    const user = userEvent.setup();
    (uploadFileToS3 as jest.Mock).mockResolvedValue({
      keyFile: 'https://example.com/test.csv',
      fileS3Route: 'fileS3Route',
      url: 'url',
    });
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });

    render(
      <ThemeProvider>
        <UploadLocationById />
      </ThemeProvider>
    );

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();

    const dropzone = screen.getByRole('form');
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(async () => {
      expect(nextButton).not.toBeDisabled();
      await user.click(nextButton);
      expect(mockHistoryPush).toHaveBeenCalledWith('PREVIEW');
    });
  });
});
