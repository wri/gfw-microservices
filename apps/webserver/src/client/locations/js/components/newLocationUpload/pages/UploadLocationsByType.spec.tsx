import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadLocationsByType } from './UploadLocationsByType';
import { useUploadLocation } from '../contexts';
import { uploadFileToS3 } from '../utils/upload';
import { ThemeProvider } from '../../../../../styles/ThemeProvider';
import { MemoryRouter, Route } from 'react-router-dom';

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
  const mockAddFile = jest.fn();
  const mockClearUploadType = jest.fn();
  const baseContext = {
    addFile: mockAddFile,
    clearUploadType: mockClearUploadType,
    uploadLocationState: { uploadType: undefined },
    selectUploadType: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('should render ById UI when route is /by-id', () => {
    renderWithRoute('/by-id');
    expect(
      screen.getByRole('heading', { name: /by id: prepare & upload location data/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('external-helper-resource-mock')).toBeInTheDocument();
    expect(
      screen.getByText(/data files must be formatted according to gfw pro requirements/i)
    ).toBeInTheDocument();
  });
});
