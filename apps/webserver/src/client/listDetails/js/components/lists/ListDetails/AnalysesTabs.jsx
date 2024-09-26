import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';

function AnalysesTabs({
  listView,
  changeListView,
  listViewOptions,
  listAnalysesStatus,
  hasLocationWithErrors,
}) {
  const post2020TreeCoverLossAnalysisStatus = listAnalysesStatus?.find(
    ({ analysisId }) => analysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS
  )?.status;

  let icon;

  if (post2020TreeCoverLossAnalysisStatus === listStatus.Draft) {
    icon = <span className="status-indicator status-indicator--blue" />;
  }

  if (post2020TreeCoverLossAnalysisStatus === listStatus.Pending) {
    icon = <CircularProgress size={15} sx={{ color: '#97bd3d' }} />;
  }

  if (post2020TreeCoverLossAnalysisStatus === listStatus.Inactive || hasLocationWithErrors) {
    icon = <span className="status-indicator status-indicator--red" />;
  }

  return (
    <Tabs
      value={listView}
      onChange={(e, newValue) => changeListView(newValue)}
      style={{ color: 'black', background: 'none' }}
      TabIndicatorProps={{ style: { display: 'none' } }} // Remove the default indicator
    >
      <Tab
        icon={icon}
        iconPosition="start"
        label="POST-2000 TREE COVER LOSS"
        value="forest_change"
        sx={{
          backgroundColor: listView === 'forest_change' ? 'white' : '#e5e5e5',
          color: 'black',
          '&.Mui-selected': {
            color: 'black',
            backgroundColor: 'white',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
          },
        }}
      />

      {listViewOptions.length > 1 && (
        // only display Commodity Risk / Forest Change view toggle in Commodity Risk lists

        <Tab
          icon={icon}
          iconPosition="start"
          label="COMMODITY RISK"
          value="commodity_risk"
          sx={{
            backgroundColor: listView === 'commodity_risk' ? 'white' : '#e5e5e5',
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
