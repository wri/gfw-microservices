import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import Table from '../../../js/common/PieChart/Table';

afterEach(cleanup);

describe('Table Component', () => {
  it('renders the table correctly with sample data', () => {
    const data = {
      1: 20,
      2: 30,
      3: 50,
    };
    const chartLabels = [
      { id: 1, legend: 'Label 1', color: 'red' },
      { id: 2, legend: 'Label 2', color: 'green' },
      { id: 3, legend: 'Label 3', color: 'blue' },
    ];
    const title = 'Test Pie Chart';
    const sumOfAreasByChartLabel = 100;

    render(
      <Table
        data={data}
        chartLabels={chartLabels}
        title={title}
        sumOfAreasByChartLabel={sumOfAreasByChartLabel}
      />
    );

    const tableHeaders = screen.getAllByRole('columnheader');
    expect(tableHeaders).toHaveLength(3);

    const tableRows = screen.getAllByRole('row');
    expect(tableRows).toHaveLength(chartLabels.length + 1);

    for (const label of chartLabels) {
      const legendLabel = screen.getByText(label.legend);
      expect(legendLabel).toBeInTheDocument();
    }
  });

  it('does not render the table when there is no data', () => {
    const data = {};
    const chartLabels = [];
    const title = 'Test Pie Chart';
    const sumOfAreasByChartLabel = 0;

    render(
      <Table
        data={data}
        chartLabels={chartLabels}
        title={title}
        sumOfAreasByChartLabel={sumOfAreasByChartLabel}
      />
    );

    const tableRows = screen.queryAllByRole('row');
    expect(tableRows).toHaveLength(1);

    for (const label of chartLabels) {
      const legendLabel = screen.queryByText(label.legend);
      expect(legendLabel).not.toBeInTheDocument();
    }
  });
});
