import React from 'react';
import { render } from '@testing-library/react';
import Chart from '../../../js/common/PieChart/Chart';

jest.mock('highcharts', () => ({
  chart: jest.fn(),
}));

describe('Chart Component', () => {
  it('renders the chart correctly', () => {
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

    const { container } = render(<Chart data={data} chartLabels={chartLabels} />);

    expect(require('highcharts').chart).toHaveBeenCalledWith(expect.objectContaining({
        series: expect.arrayContaining([
            expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({"color": "red", "legend": "Label 1", "y": 20}),
                    expect.objectContaining({"color": "green", "legend": "Label 2", "y": 30}),
                    expect.objectContaining({"color": "blue", "legend": "Label 3", "y": 50})
                ])
            })
        ]),
      }
    ));
  });
});