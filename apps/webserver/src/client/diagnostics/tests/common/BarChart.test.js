import React from 'react';
import { render } from '@testing-library/react';
import BarChart from '../../js/common/BarChart';

jest.mock('highcharts', () => ({
  chart: jest.fn(),
}));

describe('BarChart Component', () => {
  it('renders the chart correctly', () => {
    const data = [
      {
        name: 'Series 1',
        data: [10, 20, 30],
      },
      {
        name: 'Series 2',
        data: [5, 15, 25],
      },
    ];
    const plotBands = [
      {
        from: 0,
        to: 2,
        color: 'rgba(0, 0, 0, 0.1)',
      },
    ];
    const plotLines = [
      {
        value: 1,
        color: 'red',
        width: 2,
      },
    ];

    render(<BarChart data={data} plotBands={plotBands} plotLines={plotLines} />);

    expect(require('highcharts').chart).toHaveBeenCalledWith(expect.objectContaining({
      chart: expect.objectContaining({
        type: 'column',
      }),
      xAxis: expect.objectContaining({
        type: 'category',
        plotBands,
        plotLines,
      }),
      series: data,
    }));
  });
});