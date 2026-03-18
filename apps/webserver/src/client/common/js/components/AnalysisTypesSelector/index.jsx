import { Typography, Box, Link, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { ThemeProvider } from '../../../../styles/ThemeProvider';
import { locationsPage } from '../../config';
import {
  analysisTypes,
  analysisTypesForUI,
  palmRiskAnalysis,
  weeklyAlertsAnalysis,
  AlertsAnalysisFrequency,
} from '../../../../../config/env/analysisTypes.constants';
import { HelperTextWithPopover } from '../../../../components';
import { ExternalLinks, ReusableText } from '../../../../utils/constants';

import './AnalysisTypesSelector.scss';

const getUpdatedSelection = (selectedAnalyses, selectedAnalysisId) => {
  const isAnalysisBeingRemoved = selectedAnalyses.includes(selectedAnalysisId);

  if (isAnalysisBeingRemoved) {
    if (selectedAnalysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS) {
      return selectedAnalyses.filter(
        (selectedType) =>
          selectedType !== analysisTypes.PALM_RISK &&
          selectedType !== analysisTypes.FOREST_CHANGE_DIAGNOSTICS
      );
    }
    if (selectedAnalysisId === analysisTypes.ALERTS) {
      return selectedAnalyses.filter(
        (selectedType) =>
          selectedType !== AlertsAnalysisFrequency.WEEKLY && selectedType !== analysisTypes.ALERTS
      );
    }
    return selectedAnalyses.filter((selectedType) => selectedType !== selectedAnalysisId);
  } else {
    return [...selectedAnalyses, selectedAnalysisId];
  }
};

function AnalysisTypesSelector({
  selectedAnalyses,
  setSelectedAnalyses,
  commodity,
  isPalmRiskActive,
}) {
  const handleAnalyzesSelection = (selectedAnalysisId) => {
    setSelectedAnalyses(getUpdatedSelection(selectedAnalyses, selectedAnalysisId));
  };

  const baseOptions = analysisTypesForUI.flatMap((option) => {
    if (option.id === analysisTypes.ALERTS) {
      return [option, weeklyAlertsAnalysis];
    }
    if (
      option.id === analysisTypes.FOREST_CHANGE_DIAGNOSTICS &&
      (commodity === 'OILP' || isPalmRiskActive)
    ) {
      return [option, palmRiskAnalysis];
    }
    return [option];
  });

  const analysisOptions = baseOptions;

  const weeklyAlertsDescription = (
    <>
      Recent global integrated disturbance alerts, automatically updated weekly.
      <br />
      Selecting Weekly Alerts will deduct from available usage. Please see our{' '}
      <Link
        href={ExternalLinks.PriceSheet}
        target="_blank"
        rel="noopener noreferrer"
        underline="none"
      >
        Price Sheet
      </Link>{' '}
      for more information.
    </>
  );

  return (
    <ThemeProvider>
      <FormGroup className="analysis-types-selector">
        <Typography variant="h5">{locationsPage.upload.analysis}</Typography>
        <Typography variant="caption">
          Select which type(s) of data analysis you'd like to be available for this list. Note that
          analysis processing counts towards your account usage limits. See more information{' '}
          <Link href="/about?section=Fees" underline="none" target="_blank">
            here.
          </Link>
        </Typography>
        <br />
        {analysisOptions.map(({ id, label, description }) => (
          <div key={id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAnalyses.includes(id)}
                  onChange={() => handleAnalyzesSelection(id)}
                  disabled={
                    (id === analysisTypes.PALM_RISK &&
                      !selectedAnalyses.includes(analysisTypes.FOREST_CHANGE_DIAGNOSTICS)) ||
                    (id === AlertsAnalysisFrequency.WEEKLY &&
                      !selectedAnalyses.includes(analysisTypes.ALERTS))
                  }
                />
              }
              sx={{
                mr: 0,
                mb: 1.5,
                ml: id === analysisTypes.PALM_RISK || id === AlertsAnalysisFrequency.WEEKLY ? 2 : 0,
              }}
              label={
                <Box
                  sx={{ '&:hover': { cursor: 'default' } }}
                  onClick={(e) => {
                    const tag = e.target.tagName;
                    if (tag !== 'A') {
                      e.stopPropagation();
                      e.preventDefault();
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1">{label}</Typography>
                    {id === 'AFI' && (
                      <HelperTextWithPopover
                        label={
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 'bold', textTransform: 'none' }}
                          >
                            Recommended to support EUDR compliance
                          </Typography>
                        }
                        sx={{
                          px: 1.5,
                          py: 0.25,
                          ml: 1,
                          borderRadius: 20,
                          backgroundColor: (theme) => theme.palette.secondary[200],
                        }}
                      >
                        <Box sx={{ width: (theme) => theme.spacing(35), p: 1 }}>
                          <Typography variant="caption">
                            {ReusableText.EudrLegalDisclaimer}
                          </Typography>
                        </Box>
                      </HelperTextWithPopover>
                    )}
                  </Box>
                  {description && (
                    <Typography variant="caption">
                      {id === AlertsAnalysisFrequency.WEEKLY
                        ? weeklyAlertsDescription
                        : description}
                    </Typography>
                  )}
                </Box>
              }
            />
          </div>
        ))}
      </FormGroup>
    </ThemeProvider>
  );
}

export default AnalysisTypesSelector;
