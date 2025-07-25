import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UploadLocationsByType } from './UploadLocationsByType';
import { useUploadLocation } from '../contexts';
import { ThemeProvider } from '../../../../../styles/ThemeProvider';
import { MemoryRouter, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { uploadFileToS3 } from '../utils/upload';

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
    ExternalHelperResource: () => <span data-testid="external-helper-resource-mock" />,
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

function renderWithRoute(route: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[route]}>
        <Route path={route}>
          <UploadLocationsByType />
        </Route>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('UploadLocationByType', () => {
  describe('render /by-id', () => {
    const mockAddFile = jest.fn();
    const mockClearUploadType = jest.fn();
    const baseContext = {
      addFile: mockAddFile,
      clearUploadType: mockClearUploadType,
      uploadLocationState: { uploadType: undefined },
      selectUploadType: jest.fn(),
    };

    beforeEach(() => {
      (useUploadLocation as jest.Mock).mockReturnValue(baseContext);
    });

    it('should render ById UI when route is /by-id', () => {
      renderWithRoute('/by-id');
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
      uploadLocationState: { uploadType: undefined },
      selectUploadType: jest.fn(),
    };

    beforeEach(() => {
      (useUploadLocation as jest.Mock).mockReturnValue(baseContext);
    });

    it('should render ByFile UI when route is /by-file', () => {
      renderWithRoute('/by-file');

      expect(
        screen.getByRole('heading', { name: /by data file: prepare & upload location data/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId('external-helper-resource-mock')).toBeInTheDocument();
      expect(
        screen.getByText(/data files must be formatted according to gfw pro requirements/i)
      ).toBeInTheDocument();
    });

    it('should handle file upload success', async () => {
      const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
      jest.mocked(uploadFileToS3).mockResolvedValue({
        keyFile: 'https://example.com/test.csv',
        fileS3Route: 'fileS3Route',
        url: 'url',
      });

      renderWithRoute('/by-file');

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

      renderWithRoute('/by-file');

      const dropzone = screen.getByRole('form');
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            /it looks like the file you uploaded isn't one of gfw pro's accepted file types\. gfw pro supports , , , and a containing a \. please try again with a compatible file format\./i
          )
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /upload again/i })).toBeInTheDocument();
    });

    it('should allow re-uploading after failure', async () => {
      (uploadFileToS3 as jest.Mock).mockRejectedValue(new Error('Upload failed'));
      const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });

      renderWithRoute('/by-file');

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

      renderWithRoute('/by-file');

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
});
