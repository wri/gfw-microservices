import React from 'react';
import { render, screen } from '@testing-library/react';
import Table from '../../../js/AfiDiagnostics/AfiPieChart/Table';

const mockData = [
  {
    id: 'negligibleRisk',
    category: 'Negligible Risk',
    coverage: 0.75,
    totalAreaHA: 10000,
  },
  {
    id: 'nonNegligibleRisk',
    category: 'Non Negligible Risk',
    coverage: 0.25,
    totalAreaHA: 5000,
  },
];

test('renders table headers and data correctly', () => {
  render(<Table data={mockData} />);

  const coverageHeader = screen.getByText('COVERAGE (%)');
  const totalAreaHeader = screen.getByText('TOTAL AREA (HA)');
  expect(coverageHeader).toBeInTheDocument();
  expect(totalAreaHeader).toBeInTheDocument();

  const categoryLabel1 = screen.getByText('Negligible Risk');
  const coverageCell1 = screen.getByText('0.75');
  const totalAreaCell1 = screen.getByText('10,000');

  const categoryLabel2 = screen.getByText('Non Negligible Risk');
  const coverageCell2 = screen.getByText('0.25');
  const totalAreaCell2 = screen.getByText('5,000');

  expect(categoryLabel1).toBeInTheDocument();
  expect(coverageCell1).toBeInTheDocument();
  expect(totalAreaCell1).toBeInTheDocument();

  expect(categoryLabel2).toBeInTheDocument();
  expect(coverageCell2).toBeInTheDocument();
  expect(totalAreaCell2).toBeInTheDocument();
});
