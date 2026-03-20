import { Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import {
  analysisTypes,
  analysisTypesOptionsNewNames,
} from '../../../../../../config/env/analysisTypes.constants';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import {
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
  ALERTS,
} from './listViews.constants';
import { HelperTextWithPopover } from '../../../../../components';
import { ReusableText } from '../../../../../utils/constants';

function AnalysesTabs({
  listView,
  changeListView,
  listViewOptions,
  listAnalysesStatus,
  hasLocationWithErrors,
  staleAnalysisIds = [],
}) {
  const viewToAnalysisId = {
    [POST_2020_RISK_ASSESSMENT_VIEW]: analysisTypes.DEFORESTATION_KPIS,
    [FOREST_CHANGE_VIEW]: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
    [COMMODITY_RISK_VIEW]: analysisTypes.PALM_RISK,
  };

  const getStaleIndicator = (view) => {
    const analysisId = viewToAnalysisId[view];
    if (staleAnalysisIds.includes(analysisId)) {
      return (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            display: 'inline-block',
            marginLeft: 4,
          }}
        />
      );
    }
    return null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
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

  const getAnalysisLabel = (id) =>
    analysisTypesOptionsNewNames.find((analysis) => analysis.id === id).label;
  return (
    <Tabs
      value={listView}
      onChange={(e, newValue) => changeListView(newValue)}
      style={{ color: 'black', background: 'none' }}
      TabIndicatorProps={{ style: { display: 'none' } }} // Remove the default indicator
    >
      {listViewOptions.includes(POST_2020_RISK_ASSESSMENT_VIEW) && (
        <Tab
          icon={getStatusIcon(post2020RiskAssessmentStatus)}
          iconPosition="start"
          label={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography>{getAnalysisLabel(analysisTypes.DEFORESTATION_KPIS)}</Typography>
              {getStaleIndicator(POST_2020_RISK_ASSESSMENT_VIEW)}
              <HelperTextWithPopover
                label={<Typography x={{ fontWeight: 500 }}>EUDR</Typography>}
                sx={{
                  backgroundColor: (theme) => theme.palette.secondary[200],
                  borderRadius: 20,
                  px: 1,
                  '&:hover': {
                    cursor: 'default',
                  },
                }}
              >
                <Box sx={{ width: (theme) => theme.spacing(40), p: 1 }}>
                  <Typography variant="caption">{ReusableText.EudrLegalDisclaimer}</Typography>
                </Box>
              </HelperTextWithPopover>
            </Box>
          }
          value={POST_2020_RISK_ASSESSMENT_VIEW}
          data-cy="post-2020-tab"
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

      {listViewOptions.includes(ALERTS) && (
        <Tab
          icon={getStatusIcon(post2000TreeCoverLossAnalysisStatus)}
          iconPosition="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getAnalysisLabel(analysisTypes.ALERTS)}
            </Box>
          }
          value={ALERTS}
          data-cy="alerts-tab"
          sx={{
            backgroundColor: listView === ALERTS ? 'white' : '#e5e5e5',
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

      {listViewOptions.includes(FOREST_CHANGE_VIEW) && (
        <Tab
          icon={getStatusIcon(post2000TreeCoverLossAnalysisStatus)}
          iconPosition="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getAnalysisLabel(analysisTypes.FOREST_CHANGE_DIAGNOSTICS)}
              {getStaleIndicator(FOREST_CHANGE_VIEW)}
            </Box>
          }
          value={FOREST_CHANGE_VIEW}
          data-cy="post-2000-tab"
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

      {listViewOptions.includes(COMMODITY_RISK_VIEW) && (
        // only display Commodity Risk / Forest Change view toggle in Commodity Risk lists

        <Tab
          iconPosition="start"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Palm Risk Assessment
              {getStaleIndicator(COMMODITY_RISK_VIEW)}
            </Box>
          }
          value={COMMODITY_RISK_VIEW}
          data-cy="palm-risk-assessment-tab"
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
