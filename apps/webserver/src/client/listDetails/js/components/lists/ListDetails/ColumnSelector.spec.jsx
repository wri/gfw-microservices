import { render, screen, fireEvent } from '@testing-library/react';
import ColumnSelector from './ColumnSelector';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme();
// Mock global Transifex
const mockTransifex = {
  live: {
    translateText: jest.fn((text) => text),
  },
};

global.Transifex = mockTransifex;

describe('ColumnSelector', () => {
  beforeAll(() => {
    global.gtag = jest.fn();
  });
  const mockSetListColumns = jest.fn();
  const mockListColumns = [
    { accessor: 'name', show: true },
    { accessor: 'description', show: false },
    { accessor: 'location_id', show: true },
  ];
  const mockVisibleColumns = [];

  it('renders without crashing', () => {
    render(
      <MuiThemeProvider muiTheme={muiTheme}>
        <ColumnSelector
          listColumns={mockListColumns}
          visibleColumns={mockVisibleColumns}
          setListColumns={mockSetListColumns}
        />
      </MuiThemeProvider>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows Popover when button is clicked', () => {
    render(
      <MuiThemeProvider muiTheme={muiTheme}>
        <ColumnSelector
          listColumns={mockListColumns}
          visibleColumns={mockVisibleColumns}
          setListColumns={mockSetListColumns}
        />
      </MuiThemeProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/show\/hide table columns/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select\/deselect all columns/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/select\/deselect all columns/i)).toBeInTheDocument();
  });
  it('calls setListColumns when a column checkbox is clicked', () => {
    render(
      <MuiThemeProvider muiTheme={muiTheme}>
        <ColumnSelector
          listColumns={mockListColumns}
          visibleColumns={mockVisibleColumns}
          setListColumns={mockSetListColumns}
        />
      </MuiThemeProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const descriptionCheckbox = screen.getByLabelText(/description/i);
    fireEvent.click(descriptionCheckbox);

    expect(mockSetListColumns).toHaveBeenCalledTimes(1);

    const updatedColumns = mockSetListColumns.mock.calls[0][0];
    expect(updatedColumns).toContain('description');
  });
});
