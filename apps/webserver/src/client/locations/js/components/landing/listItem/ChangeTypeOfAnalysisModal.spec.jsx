import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ChangeTypeOfAnalysisModal from './ChangeTypeOfAnalysisModal';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import { requestGeoTrellisAnalyzeList } from '../../../utils/requestUtils';

jest.mock('../../../utils/requestUtils', () => ({
  requestGeoTrellisAnalyzeList: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../../../common/js/components/Loaders/InlineLoader', () => () => (
  <div data-testid="inline-loader">Loading...</div>
));

Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
  },
  writable: true,
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

const theme = createTheme();
const muiTheme = getMuiTheme();

const defaultProps = {
  listId: '123',
  listName: 'Test List',
  setIsChangeTypeOfAnalysisModalOpen: jest.fn(),
  isChangeTypeOfAnalysisModalOpen: true,
  listAnalysesStatus: [
    {
      analysisId: 'AFI',
      status: 1,
      updateTime: '2025-01-30T12:17:05.5910000',
    },
    {
      analysisId: 'FCD',
      status: 1,
      updateTime: '2025-01-30T12:17:07.5910000',
    },
  ],
  commodity: 'COCO',
  isPalmOilBackwardComp: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  window.location.reload = jest.fn();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
});

const renderComponent = (props) => {
  return render(
    <MuiThemeProvider muiTheme={muiTheme}>
      <ThemeProvider theme={theme}>
        <ChangeTypeOfAnalysisModal {...defaultProps} {...props} />
      </ThemeProvider>
    </MuiThemeProvider>
  );
};

describe('ChangeTypeOfAnalysisModal', () => {
  it('renders correctly and buttons are disabled initially', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: 'Submit Analysis' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeDisabled();
  });

  it('enables buttons when an analysis is removed', async () => {
    renderComponent();
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: /post-2020 risk assessment recommended to support eudr compliance deforestation in natural forest since 2021 \+ additional contextual datasets/i,
      })
    );

    expect(screen.getByRole('button', { name: 'Submit Analysis' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeEnabled();
  });

  it('shows confirmation prompt when a new analysis is added', async () => {
    renderComponent();
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: /recent deforestation alerts recent deforestation alerts, updated weekly/i,
      })
    );
    expect(screen.getByRole('button', { name: 'Submit Analysis' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Submit Analysis' }));
    expect(screen.getByText(/You have added a new analysis to your list/)).toBeInTheDocument();
  });

  it('calls saveAsDraft when "Save as Draft" is clicked', async () => {
    renderComponent();
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: /recent deforestation alerts recent deforestation alerts, updated weekly/i,
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save as Draft' }));

    expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith('/api/list/123/selectedAnalyses', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"saveAsDraft":true'),
    });
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled());
  });

  it('submits changes when removing an analysis', async () => {
    renderComponent();
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: /post-2000 forest change annual tree cover loss since 2001 \+ additional contextual and regional datasets/i,
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit Analysis' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith('/api/list/123/selectedAnalyses', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"saveAsDraft":false'),
    });
    expect(requestGeoTrellisAnalyzeList).not.toHaveBeenCalled();
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled());
  });

  it('calls saveAnalysisSelection and shows confirmation when adding an analysis, then submits after confirmation', async () => {
    renderComponent();
    // Simulate adding a new analysis (assuming "ALERTS" is available in the selector)
    await userEvent.click(screen.getByRole('checkbox', { name: /alerts/i }));
    await userEvent.click(screen.getByRole('button', { name: /submit analysis/i }));
    // Confirmation prompt should appear
    expect(screen.getByText(/You have added a new analysis to your list/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));

    expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      '/api/list/123/selectedAnalyses',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"saveAsDraft":false'),
      })
    );
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled());
  });
});
