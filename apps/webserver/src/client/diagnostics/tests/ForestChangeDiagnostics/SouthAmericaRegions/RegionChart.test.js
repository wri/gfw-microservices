import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import RegionChart from '../../../js/ForestChangeDiagnostics/SouthAmericaRegions/RegionChart';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { MOCK_ARGENTINA_DATA } from './mockArgentinaData';

jest.mock('../../../js/ForestChangeDiagnostics/SouthAmericaRegions/DateRangeSlider', () => () => {
  return <div></div>;
});

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

// Mock any other dependencies as needed

describe('RegionChart Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', async () => {
    const listId = 1;
    const fireDownload = jest.fn();

    render(
      <MuiThemeProvider>
        <RegionChart listId={listId} data={MOCK_ARGENTINA_DATA} fireDownload={fireDownload} />
      </MuiThemeProvider>
    );

    const chartHeader = screen.getAllByTestId('chart-header-title');
    expect(chartHeader.length > 0).toBeTruthy();

    const barChart = screen.getByTestId('bar-chart');
    expect(barChart).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/fcd?listId=${listId}&country=Argentina&category=WDPA,landmark`,
        expect.objectContaining({
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    const pieCharts = screen.getAllByTestId('pie-chart');
    expect(pieCharts.length > 0).toBeTruthy();
  });
});
