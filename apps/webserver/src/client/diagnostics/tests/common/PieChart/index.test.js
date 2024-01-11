import React from 'react';
import { render, screen } from '@testing-library/react';
import PieChart from '../../../js/common/PieChart/index';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

describe('PieChart Component', () => {
  it('renders the component correctly with non-zero total area', () => {
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
    const informationBubbleId = 'info-bubble-1';

    render(
      <MuiThemeProvider>
        <PieChart
          data={data}
          chartLabels={chartLabels}
          title={title}
          informationBubbleId={informationBubbleId}
        />
      </MuiThemeProvider>
    );

    const chartHeader = screen.getAllByText(title);
    expect(chartHeader).toHaveLength(2);

    const chart = screen.getByTestId('chart-component');
    expect(chart).toBeInTheDocument();
  });
});
