import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import Popover from 'material-ui/Popover';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AfiDiagnosticsTable from './AfiDiagnosticsTable';
import AfiPieChart from './AfiPieChart';
import DiagnosticsMenuBar from '../common/DiagnosticsMenuBar';
import DiagnosticsBreadCrums from '../common/DiagnosticsBreadCrums';
import { analysisTypes } from '../../../../config/env/analysisTypes.constants';
import ConfirmDialog from '../../../locations/js/components/lists/download/confirmDialog';
import IconButtonWrapper from '../../../locations/js/components/IconButtonWrapper';
import { locationsPage } from '../../../common/js/config';
import { closePopover } from '../../../locations/js/utils/togglePopover';
import InfoBubbleContent from '../../../common/js/components/InfoBubbleContent';
import '../common/DiagnosticsContainer.scss';

const mapStateToProps = ({ infoBubbleCache, popover }) => ({ infoBubbleCache, popover });

function AfiDiagnostics({ popover }) {
  const [isLoading, setIsLoading] = useState(true);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [tableData, setTableData] = useState({});
  const [chartData, setChartData] = useState({});

  const listId = parseInt(new URLSearchParams(location.search).get('listId'), 10);
  const isSharedList = Boolean(new URLSearchParams(location.search).get('shared'));

  const [selectedList, setSelectedList] = useState({});
  const [displayPopover, setDisplayPopover] = useState(false);
  console.log(popover)
  const getAfiAnalysisForListId = () => {
    return fetch(`/api/afi/analysis/${listId}`, {
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

  const { list_name } = selectedList;

  return (
    <>
      <Popover
        open={popover?.displayPopover}
        anchorEl={popover?.anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={closePopover}
      >
        <InfoBubbleContent bubbleData={popover?.bubbleData} closeBubble={closePopover} />
      </Popover>
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
        <div style={{ backgroundColor: 'rgb(250, 250, 250)' }}>
          <DiagnosticsMenuBar
            listId={listId}
            selectedDiagnostics={analysisTypes.DEFORESTATION_KPIS}
            downloadDiagnostics={downloadDiagnostics}
          />
          <div className="diagnostics-container">
            {selectedList && (
              <DiagnosticsBreadCrums
                selectedList={selectedList}
                diagnosticName={'Afi'}
                isSharedList={isSharedList}
              />
            )}
            <div className="locations-diagnostics__body">
              <h2 className="locations-diagnostics__subtitle">
                {list_name}
                <IconButtonWrapper id={locationsPage.infoBubbleConfig.analysisOverview} />
              </h2>
              <AfiDiagnosticsTable data={tableData} />
              <h2 className="locations-diagnostics__subtitle">
                Administrative Areas Overlap
                <IconButtonWrapper id={locationsPage.infoBubbleConfig.landcoverCalc} />
              </h2>
              <Card>
                <CardContent>
                  <AfiPieChart data={chartData} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={openDownloadDialog} setDialogOpen={setOpenDownloadDialog} />
    </>
  );
}

export default connect(mapStateToProps)(AfiDiagnostics);
