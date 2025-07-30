import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { UploadLocationsByType } from './UploadLocationsByType';
import { useUploadLocation } from '../contexts';
import { uploadFileToS3 } from '../utils/upload';
import { UploadType } from '../types';

jest.mock('../components', () => ({
  ...jest.requireActual('../components'),
  NavBar: () => <span />,
  UploadByFileFolderIcon: () => <span />,
  UploadByFileInstructions: () => <span />,
}));

const externalHelperResourceMock = jest.fn();
jest.mock('../../../../../components', () => {
  return {
    ...jest.requireActual('../../../../../components'),
    ExternalHelperResource: (props) => {
      externalHelperResourceMock(props);
      return <span data-testid="external-helper-resource-mock" />;
    },
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
  useFileUpload: jest.fn(),
}));

describe('UploadLocationByType', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('render /by-id', () => {
    const mockAddFile = jest.fn();
    const mockClearUploadType = jest.fn();
    const baseContext = {
      addFile: mockAddFile,
      clearUploadType: mockClearUploadType,
      uploadLocationState: { uploadType: UploadType.ById },
      selectUploadType: jest.fn(),
    };

    beforeEach(() => {
      (useUploadLocation as jest.Mock).mockReturnValue(baseContext);
    });

    it('should render ById UI when route is /by-id', () => {
      render(<UploadLocationsByType />);
      expect(
        screen.getByRole('heading', { name: /by id: prepare & upload location data/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId('external-helper-resource-mock')).toBeInTheDocument();
      expect(
        screen.getByText(/data files must be formatted according to gfw pro requirements/i)
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
    });
  });

  describe('render /by-file', () => {
    const mockAddFile = jest.fn();
    const mockClearUploadType = jest.fn();
    const baseContext = {
      addFile: mockAddFile,
      clearUploadType: mockClearUploadType,
      uploadLocationState: { uploadType: UploadType.ByFile },
      selectUploadType: jest.fn(),
    };

    beforeEach(() => {
      (useUploadLocation as jest.Mock).mockReturnValue(baseContext);
    });

    it('should render correctly', () => {
      render(<UploadLocationsByType />);

      expect(
        screen.getByRole('heading', { name: /by data file: prepare & upload location data/i })
      ).toBeInTheDocument();
      screen.getByText(
        /first, prepare your data in a format accepted by gfw pro\. then, upload your file\(s\)\./i
      );
      screen.getByRole('heading', {
        name: /how to prepare your data/i,
      });
      expect(
        screen.getByText(/data files must be formatted according to gfw pro requirements/i)
      ).toBeInTheDocument();

      screen.getByText(
        /before uploading your data, it must be formatted according to a gfw pro template\. click on “data templates” to learn more about data formatting and download templates\. if you already have your data formatted for gfw pro, just upload it below\./i
      );

      expect(screen.getByTestId('external-helper-resource-mock')).toBeInTheDocument();

      expect(externalHelperResourceMock).toHaveBeenCalledWith({
        text: 'Step-by-step instructions',
        url: 'https://globalforestwatch.org/help/gfw-pro/guides/complete-selected-template',
        color: 'info',
      });
    });

    it('should handle file upload success', async () => {
      const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
      jest.mocked(uploadFileToS3).mockResolvedValue({
        keyFile: 'https://example.com/test.csv',
        fileS3Route: 'fileS3Route',
        url: 'url',
      });

      render(<UploadLocationsByType />);

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(uploadFileToS3).toHaveBeenCalledWith(file);
        expect(mockAddFile).toHaveBeenCalledWith({
          keyFile: 'https://example.com/test.csv',
          fileS3Route: 'fileS3Route',
          url: 'url',
        });
      });
    });

    it('should display an error message for unsupported file types via drag and drop', async () => {
      const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });

      render(<UploadLocationsByType />);

      const dropzone = screen.getByRole('form');
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            /looks like the file you uploaded isn't one of GFW Pro's accepted file types/i
          )
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /upload again/i })).toBeInTheDocument();
      });
    });

    it('should allow re-uploading after failure', async () => {
      (uploadFileToS3 as jest.Mock).mockRejectedValue(new Error('Upload failed'));
      const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });

      render(<UploadLocationsByType />);

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Upload again')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      });
    });

    it('should open data templates modal', async () => {
      render(<UploadLocationsByType />);

      expect(screen.queryByTestId('data-templates')).toBeNull();
      await user.click(screen.getByRole('button', { name: /data templates/i }));
      expect(screen.getByTestId('data-templates')).toBeInTheDocument();
    });

    it('should navigate back to options page when user clicks on cancel', async () => {
      render(<UploadLocationsByType />);

      expect(mockClearUploadType).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockClearUploadType).toHaveBeenCalledTimes(1);
    });

    it('should navigate to preview page when file upload is successful', async () => {
      (uploadFileToS3 as jest.Mock).mockResolvedValue({
        keyFile: 'https://example.com/test.csv',
        fileS3Route: 'fileS3Route',
        url: 'url',
      });
      const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });

      render(<UploadLocationsByType />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      const dropzone = screen.getByRole('form');
      await waitFor(() =>
        fireEvent.drop(dropzone, {
          dataTransfer: { files: [file] },
        })
      );

      expect(nextButton).not.toBeDisabled();
      await user.click(nextButton);
      expect(mockHistoryPush).toHaveBeenCalledWith('PREVIEW');
    });
  });
});
