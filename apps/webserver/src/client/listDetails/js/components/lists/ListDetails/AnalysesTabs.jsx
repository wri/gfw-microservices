import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import {
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
} from './listViews.constants';

function AnalysesTabs({
  listView,
  changeListView,
  listViewOptions,
  listAnalysesStatus,
  hasLocationWithErrors,
}) {
  const getStatusIcon = (status) => {
    switch (status) {
      case listStatus.Draft:
        return <span className="status-indicator status-indicator--blue" />;
      case listStatus.Pending:
        return <CircularProgress size={15} sx={{ color: '#97bd3d' }} />;
      case listStatus.Inactive:
      case hasLocationWithErrors:
        return <span className="status-indicator status-indicator--red" />;
      default:
        return null;
    }
  };
  const post2000TreeCoverLossAnalysisStatus = listAnalysesStatus?.find(
    ({ analysisId }) => analysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS
  )?.status;

  const post2020RiskAssessmentStatus = listAnalysesStatus?.find(
    ({ analysisId }) => analysisId === analysisTypes.DEFORESTATION_KPIS
  )?.status;

  return (
    <Tabs
      value={listView}
      onChange={(e, newValue) => changeListView(newValue)}
      style={{ color: 'black', background: 'none' }}
      TabIndicatorProps={{ style: { display: 'none' } }} // Remove the default indicator
    >
      {post2020RiskAssessmentStatus && (
        <Tab
          icon={getStatusIcon(post2020RiskAssessmentStatus)}
          iconPosition="start"
          label="Post-2020 Risk Assessment"
          value={POST_2020_RISK_ASSESSMENT_VIEW}
          sx={{
            backgroundColor: listView === POST_2020_RISK_ASSESSMENT_VIEW ? 'white' : '#e5e5e5',
            color: 'black',
            '&.Mui-selected': {
              color: 'black',
              backgroundColor: 'white',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
            },
          }}
        />
      )}

      {post2000TreeCoverLossAnalysisStatus && (
        <Tab
          icon={getStatusIcon(post2000TreeCoverLossAnalysisStatus)}
          iconPosition="start"
          label="POST-2000 TREE COVER LOSS"
          value={FOREST_CHANGE_VIEW}
          sx={{
            backgroundColor: listView === FOREST_CHANGE_VIEW ? 'white' : '#e5e5e5',
            color: 'black',
            '&.Mui-selected': {
              color: 'black',
              backgroundColor: 'white',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
            },
          }}
        />
      )}

      {listViewOptions.length > 1 && (
        // only display Commodity Risk / Forest Change view toggle in Commodity Risk lists

        <Tab
          icon={null}
          iconPosition="start"
          label="COMMODITY RISK"
          value={COMMODITY_RISK_VIEW}
          sx={{
            backgroundColor: listView === COMMODITY_RISK_VIEW ? 'white' : '#e5e5e5',
            color: 'black',
            '&.Mui-selected': {
              color: 'black',
              backgroundColor: 'white',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
            },
          }}
        />
      )}
    </Tabs>
  );
}

export default AnalysesTabs;
