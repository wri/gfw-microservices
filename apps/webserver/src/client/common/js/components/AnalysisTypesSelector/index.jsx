import { Typography, Box, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { ThemeProvider } from '../../../../styles/ThemeProvider';
import { locationsPage } from '../../config';
import {
  analysisTypes,
  analysisTypesForUI,
  palmRiskAnalysis,
  weeklyAlertsAnalysis,
  AlertsAnalysisFrequency,
} from '../../../../../config/env/analysisTypes.constants';
import { HelperTextWithPopover, Link } from '../../../../components';
import { ExternalLinks, ReusableText } from '../../../../utils/constants';
import featureFlags from '../../../../../utils/general.utils';
import { useTransifexTranslation } from '../../../../hooks/useTransifexTranslation';
import { getManualTranslation } from '../../../../listDetails/js/config/columns/columnHeaders.constants';

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
  const tRecommended = useTransifexTranslation('Recommended to support EUDR compliance');
  const tSubtitle = useTransifexTranslation(
    "Select which type(s) of data analysis you'd like to be available for this list. Note that analysis processing counts towards your account usage limits. See more information"
  );
  const tWeeklyDesc = useTransifexTranslation(
    'Recent global integrated disturbance alerts, automatically updated weekly.'
  );
  const tWeeklyWarning = useTransifexTranslation(
    'Selecting Weekly Alerts will deduct from available usage. Please see our'
  );
  const tPriceSheet = useTransifexTranslation('Price Sheet');
  const tForMoreInfo = useTransifexTranslation('for more information.');

  const handleAnalyzesSelection = (selectedAnalysisId) => {
    setSelectedAnalyses(getUpdatedSelection(selectedAnalyses, selectedAnalysisId));
  };

  const baseOptions = analysisTypesForUI.flatMap((option) => {
    if (option.id === analysisTypes.ALERTS && featureFlags.isWeeklyAlertsAvailable) {
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
      {tWeeklyDesc}
      <br />
      {tWeeklyWarning}{' '}
      <Link href={ExternalLinks.PriceSheet} target="_blank" rel="noopener noreferrer">
        {tPriceSheet}
      </Link>{' '}
      {tForMoreInfo}
    </>
  );

  return (
    <ThemeProvider>
      <FormGroup className="analysis-types-selector">
        <Typography variant="h5">{locationsPage.upload.analysis}</Typography>
        <Typography variant="caption">
          {tSubtitle}{' '}
          <Link href="/about?section=Fees" target="_blank">
            here
          </Link>
          .
        </Typography>
        <br />
        {analysisOptions.map(({ id, label, description }) => {
          const lang = window.Transifex?.live?.getSelectedLanguageCode?.() || 'en';
          const translatedLabel =
            window.Transifex?.live?.translateText?.(label) !== label
              ? window.Transifex.live.translateText(label)
              : getManualTranslation(label, lang);
          const translatedDescription =
            description &&
            (window.Transifex?.live?.translateText?.(description) !== description
              ? window.Transifex.live.translateText(description)
              : getManualTranslation(description, lang));
          return (
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
                  ml:
                    id === analysisTypes.PALM_RISK || id === AlertsAnalysisFrequency.WEEKLY ? 2 : 0,
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
                      <Typography variant="body1">{translatedLabel}</Typography>
                      {id === 'AFI' && (
                        <HelperTextWithPopover
                          label={
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 'bold', textTransform: 'none' }}
                            >
                              {tRecommended}
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
                          : translatedDescription}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </div>
          );
        })}
      </FormGroup>
    </ThemeProvider>
  );
}

export default AnalysisTypesSelector;
