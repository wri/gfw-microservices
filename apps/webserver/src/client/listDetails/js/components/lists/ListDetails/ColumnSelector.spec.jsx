import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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
  const mockSetListColumns = jest.fn();
  const mockListColumns = [
    { accessor: 'name', show: true },
    { accessor: 'description', show: false },
    { accessor: 'location_id', show: true },
  ];
  const mockVisibleColumns = [];
  afterEach(cleanup);
  beforeEach(() => {
    mockSetListColumns.mockClear();
  });

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

    expect(screen.getByRole('menu')).toBeInTheDocument();

    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
  });
});
