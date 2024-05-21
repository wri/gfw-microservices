import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import AfiDiagnosticsTable from '../../js/AfiDiagnostics/AfiDiagnosticsTable';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { forestLossDatasetIds } from '../../js/AfiDiagnostics/forestLossDatasets.constants';

const mockData = [
  {
    country: 'Country1',
    subState: 'SubState1',
    coverageHA: 100,
    naturalForestLossHA: 20,
    negligibleRisk: true,
  },
  {
    country: 'Country2',
    subState: 'SubState2',
    coverageHA: 150,
    naturalForestLossHA: 30,
    negligibleRisk: false,
  },
];

afterEach(cleanup);

test('renders table with correct headers', () => {
  render(
    <MuiThemeProvider>
      <AfiDiagnosticsTable data={mockData} />
    </MuiThemeProvider>
  );

  const countryHeader = screen.getByText('Country');
  const subStateHeader = screen.getByText('Sub-state');
  const coverageHeader = screen.getByText('Natural Forest Coverage (HA)');
  const lossHeader = screen.getByText('Natural Forest Loss (HA)');
  const riskHeader = screen.getByText('Negligible Risk');

  expect(countryHeader).toBeInTheDocument();
  expect(subStateHeader).toBeInTheDocument();
  expect(coverageHeader).toBeInTheDocument();
  expect(lossHeader).toBeInTheDocument();
  expect(riskHeader).toBeInTheDocument();
});

test('hides Negligible Risk if JRC dataset is selected', () => {
  render(
    <MuiThemeProvider>
      <AfiDiagnosticsTable data={mockData} forestLossDataset={forestLossDatasetIds.JRC} />
    </MuiThemeProvider>
  );

  const countryHeader = screen.getByText('Country');
  const subStateHeader = screen.getByText('Sub-state');
  const coverageHeader = screen.getByText('Natural Forest Coverage (HA)');
  const lossHeader = screen.getByText('Natural Forest Loss (HA)');

  expect(countryHeader).toBeInTheDocument();
  expect(subStateHeader).toBeInTheDocument();
  expect(coverageHeader).toBeInTheDocument();
  expect(lossHeader).toBeInTheDocument();

  const riskHeader = screen.queryByText('Negligible Risk');

  expect(riskHeader).not.toBeInTheDocument();
});

test('renders table rows with data', () => {
  render(
    <MuiThemeProvider>
      <AfiDiagnosticsTable data={mockData} />
    </MuiThemeProvider>
  );

  const countryCell1 = screen.getByText('Country1');
  const subStateCell1 = screen.getByText('SubState1');
  const coverageCell1 = screen.getByText('100');
  const lossCell1 = screen.getByText('20');
  const riskCell1 = screen.getByText('YES');

  const countryCell2 = screen.getByText('Country2');
  const subStateCell2 = screen.getByText('SubState2');
  const coverageCell2 = screen.getByText('150');
  const lossCell2 = screen.getByText('30');
  const riskCell2 = screen.getByText('No');

  expect(countryCell1).toBeInTheDocument();
  expect(subStateCell1).toBeInTheDocument();
  expect(coverageCell1).toBeInTheDocument();
  expect(lossCell1).toBeInTheDocument();
  expect(riskCell1).toBeInTheDocument();

  expect(countryCell2).toBeInTheDocument();
  expect(subStateCell2).toBeInTheDocument();
  expect(coverageCell2).toBeInTheDocument();
  expect(lossCell2).toBeInTheDocument();
  expect(riskCell2).toBeInTheDocument();
});
