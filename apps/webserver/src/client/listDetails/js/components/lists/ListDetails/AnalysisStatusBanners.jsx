import * as React from 'react';
import ReportIcon from '@mui/icons-material/Report';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AlertBanner from './AlertBanner';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';

export default function AnalysisStatusBanners({
  isDiagnosticStatusDraft,
  hasLocationWithErrors,
  openDraftSubmitDialog,
  toggleReRunAnalysisDialog,
  listAnalysesStatus,
}) {
  const isFailedAnalysis = !!listAnalysesStatus.find(
    ({ status }) => status === listStatus.Inactive
  );

  const alertsConfig = [
    {
      condition: !isFailedAnalysis && hasLocationWithErrors,
      title: 'Location errors',
      backgroundColor: '#F24E1E',
      icon: <ReportIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
      message: (
        <>
          Some of your locations have failed analysis. <br /> This means that these locations won’t
          be included in list diagnostic calculations.
        </>
      ),
      buttonText: 'Try Again',
      onButtonClick: openDraftSubmitDialog,
    },
    {
      condition: isFailedAnalysis,
      title: 'Analysis has failed',
      backgroundColor: '#F24E1E',
      icon: <ReportIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
      message: <>To receive results, resubmit this list for analysis.</>,
      buttonText: 'Try Again',
      onButtonClick: toggleReRunAnalysisDialog,
    },
    {
      condition: isDiagnosticStatusDraft,
      title: 'DRAFT',
      backgroundColor: '#58a9cd',
      icon: <EditNoteIcon style={{ marginRight: '5px' }} fontSize="inherit" />,
      message: (
        <>
          Your list is currently in Draft state. To view data for your list, please submit for
          analysis.
        </>
      ),
      buttonText: 'Submit for Analysis',
      onButtonClick: openDraftSubmitDialog,
    },
  ];

  return (
    <>
      {alertsConfig.map(
        (alert, index) =>
          alert.condition && (
            <React.Fragment key={index}>
              <AlertBanner {...alert} />
            </React.Fragment>
          )
      )}
    </>
  );
}
