import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chart from './Chart';
import Table from './Table';
import DiagnosticsChartHeader from '../../../common/DiagnosticsChartHeader';
import { locationsPage } from '../../../../../common/js/config';
import '../../../common/DiagnosticsChartContainer.scss';

function OtbnAreaChart({ data }) {
  return (
    <>
      <DiagnosticsChartHeader
        title={locationsPage.diagnosticsTitles.ARGENTINA_OTBN_OVERLAP}
        informationBubbleId={locationsPage.infoBubbleConfig.treeCoverLossArgOtbnYearly}
      />
      <Card>
        <CardContent>
          <div className="diagnostics-chart-container">
            <div className="diagnostics-chart-container__chart">
              <Chart data={data} />
            </div>
            <Table data={data} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default OtbnAreaChart;
