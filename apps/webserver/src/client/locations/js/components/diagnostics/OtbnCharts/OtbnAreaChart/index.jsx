import React from 'react';
import Chart from './Chart';
import Table from './Table';
import IconButtonWrapper from '../../../IconButtonWrapper';
import { locationsPage } from '../../../../../../common/js/config';
import './OtbnChartContainer.scss';

function OtbnAreaChart({ data }) {
  return (
    <div className="otbn-chart-container">
      <div className="otbn-pie-chart">
        <div className="subsection-subtitle">
          {locationsPage.diagnosticsTitles.ARGENTINA_OTBN_OVERLAP}
          <IconButtonWrapper id={locationsPage.infoBubbleConfig.treeCoverLossArgOtbnYearly} />
        </div>
        <Chart data={data} />
      </div>
      <Table data={data} />
    </div>
  );
}

export default OtbnAreaChart;
