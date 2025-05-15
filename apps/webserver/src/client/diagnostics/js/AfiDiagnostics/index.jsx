import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, MenuItem, FormControl, Select } from '@mui/material';
import AfiDiagnosticsTable from './AfiDiagnosticsTable';
import AfiPieChart from './AfiPieChart';
import DiagnosticsMenuBar from '../common/DiagnosticsMenuBar';
import DiagnosticsBreadCrumbs from '../common/DiagnosticsBreadCrumbs';
import { analysisTypes } from '../../../../config/env/analysisTypes.constants';
import ConfirmDialog from '../../../locations/js/components/lists/download/confirmDialog';
import infoBubbleConfig from '../../../common/js/infoBubbleConfig.constants';
import InfoBubble from '../../../common/js/components/InfoBubble';
import getAnalysisAvailabilityMessage from '../common/getAnalysisAvailabilityMessage';
import { forestLossDatasetIds, forestLossDatasets } from './forestLossDatasets.constants';
import '../common/DiagnosticsContainer.scss';
import { LoadingModal } from '../../../components';

function AfiDiagnostics() {
  const [isLoading, setIsLoading] = useState(true);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [tableData, setTableData] = useState({});
  const [chartData, setChartData] = useState({});

  const [forestLossDataset, setForestLossDataset] = useState(forestLossDatasetIds.SBTN);

  const handleChange = (event) => {
    setForestLossDataset(event.target.value);
  };

  const listId = parseInt(new URLSearchParams(location.search).get('listId'), 10);
  const locationId = parseInt(new URLSearchParams(location.search).get('locationId'), 10);
  const isSharedList = Boolean(new URLSearchParams(location.search).get('shared'));
  const [selectedList, setSelectedList] = useState({});

  const getAfiAnalysisForListId = () => {
    // Base URL
    let url = `/api/afi/analysis/${listId}`;
    // Add query parameter if locationId is defined
    if (locationId !== undefined && !isNaN(locationId)) {
      url += `?locationId=${locationId}`;
    }

    return fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    }).then((res) => res.json());
  };

  const getDiagnosticsData = () => {
    return fetch(`/diagnostics/${listId}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        locationId: '',
        isSharedList,
      }),
    }).then((res) => res.json());
  };

  useEffect(() => {
    gtag('event', 'User accesses Deforestation Reporting KPIs diagnostics view', {
      event_category: 'Deforestation Reporting KPIs',
    });
    Promise.all([getAfiAnalysisForListId(), getDiagnosticsData()])
      .then(([afiAnalysisData, diagnosticsData]) => {
        const { regionalInfo, negligibleRiskStats } = afiAnalysisData;
        const { selectedList } = diagnosticsData;
        setTableData(regionalInfo);
        setChartData(negligibleRiskStats);
        setSelectedList(selectedList);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.warn(error);
      });
  }, []);

  const downloadDiagnostics = useCallback(() => {
    setIsLoading(true);
    setOpenDownloadDialog(true);
    gtag('event', 'User downloads Deforestation Reporting KPIs diagnostics', {
      event_category: 'Deforestation Reporting KPIs',
    });
    fetch(`/api/afi/download?listId=${listId}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/zip',
      },
    })
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn(error);
      });
  }, [listId]);

  const { list_name, list_status_id, listAnalysesStatus } = selectedList;

  const { DiagnosticsStatusMessage, isListBeingAnalyzed } = getAnalysisAvailabilityMessage(
    list_status_id,
    listAnalysesStatus
  );

  const isNegligibleRiskAvailable = forestLossDataset !== forestLossDatasetIds.JRC;
  return (
    <>
      <LoadingModal isLoading={isLoading} />
      {!isLoading && DiagnosticsStatusMessage && DiagnosticsStatusMessage}
      {!isLoading && !isListBeingAnalyzed && (
        <div style={{ backgroundColor: 'rgb(250, 250, 250)' }}>
          <DiagnosticsMenuBar
            listId={listId}
            selectedDiagnostics={analysisTypes.DEFORESTATION_KPIS}
            downloadDiagnostics={downloadDiagnostics}
          />
          <div className="diagnostics-container">
            {selectedList && (
              <DiagnosticsBreadCrumbs
                selectedList={selectedList}
                isSharedList={isSharedList}
                analysisId={analysisTypes.DEFORESTATION_KPIS}
              />
            )}
            <div className="locations-diagnostics__body">
              <h2 className="locations-diagnostics__subtitle">
                {list_name}
                <InfoBubble infoBubbleId={infoBubbleConfig.analysisOverview} />
              </h2>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>Forest Loss Dataset:</span>
                <FormControl>
                  <Select
                    id="forest-loss-dataset-selector"
                    value={forestLossDataset}
                    onChange={handleChange}
                  >
                    {forestLossDatasets.map(({ id, label, dataCy }) => (
                      <MenuItem key={id} value={id} data-cy={dataCy}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <AfiDiagnosticsTable
                data={tableData}
                forestLossDataset={forestLossDataset}
                isLocationLevel={!!locationId}
              />
              {isNegligibleRiskAvailable && (
                <>
                  <h2 className="locations-diagnostics__subtitle">
                    Negligible Risk Overlap
                    <InfoBubble infoBubbleId={infoBubbleConfig.landcoverCalc} />
                  </h2>
                  <Card>
                    <CardContent>
                      <AfiPieChart data={chartData} />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={openDownloadDialog} setDialogOpen={setOpenDownloadDialog} />
    </>
  );
}

export default AfiDiagnostics;
