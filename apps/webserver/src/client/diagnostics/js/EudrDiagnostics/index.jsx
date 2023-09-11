import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import EudrDiagnosticsTable from './EudrDiagnosticsTable';
import EudrPieChart from './EudrPieChart';
import DiagnosticsMenuBar from '../common/DiagnosticsMenuBar';
import DiagnosticsBreadCrums from '../common/DiagnosticsBreadCrums';
import '../common/DiagnosticsContainer.scss';

const mockTableData = [
  {
    id: 1,
    country: 'Ghana',
    subState: 'Acra',
    coverageHA: 500,
    naturalForestLossHA: 100,
    negligibleRisk: true,
  },
  {
    id: 2,
    country: 'Cote d´Ivoire',
    subState: 'Abidjan',
    coverageHA: 350,
    naturalForestLossHA: 20,
    negligibleRisk: false,
  },
];

const chartMockData = [
  {
    id: 'negligibleRisk',
    category: 'Negligible Risk',
    coverage: 69.76,
    totalAreaHA: 1073,
  },
  {
    id: 'nonNegligibleRisk',
    category: 'Non Negligible Risk',
    coverage: 30.26,
    totalAreaHA: 654,
  },
];

function EudrDiagnostics({ selectedList }) {
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState({});
  const [chartData, setChartData] = useState({});

  const listId = parseInt(new URLSearchParams(location.search).get('listId'), 10);
  const isSharedList = JSON.parse(new URLSearchParams(location.search).get('shared'));

  useEffect(() => {
    setTableData(mockTableData);
    setChartData(chartMockData);
    setIsLoading(false);
  }, []);

  const downloadDiagnostics = () => {
    setIsLoading(true);
    fetch(`/api/eudr/download?listId=${listId}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/zip',
      },
    })
      .then((result) => {
        setIsLoading(false);
        console.log(result);
      })
      .catch((error) => {
        console.warn(error);
      });
  };

  const { list_name } = selectedList;

  return (
    <>
      {isLoading && (
        <div
          style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress color="success" />
        </div>
      )}
      {!isLoading && (
        <>
          <DiagnosticsMenuBar
            listId={listId}
            selectedDiagnostics={'AFI'}
            downloadDiagnostics={downloadDiagnostics}
          />
          <div className="diagnostics-container">
            <DiagnosticsBreadCrums selectedList={selectedList} diagnosticName={'EUDR'} />
            <div className="locations-diagnostics__body">
              <h2 className="locations-diagnostics__subtitle">{list_name}</h2>
              <EudrDiagnosticsTable data={tableData} />
              <h2 className="locations-diagnostics__subtitle">Administrative Areas Overlap</h2>
              <Paper elevation={3}>
                <EudrPieChart data={chartData} />
              </Paper>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default EudrDiagnostics;
