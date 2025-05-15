import { Typography, Box, Link, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { ThemeProvider } from '../../../../styles/ThemeProvider';
import { locationsPage } from '../../config';
import {
  analysisTypes,
  analysisTypesForUI,
  palmRiskAnalysis,
} from '../../../../../config/env/analysisTypes.constants';
import BetaTag from '../BetaTag';

import './AnalysisTypesSelector.scss';

const getUpdatedSelection = (selectedAnalyses, selectedAnalysisId) => {
  const isAnalysisBeingRemoved = selectedAnalyses.includes(selectedAnalysisId);

  if (isAnalysisBeingRemoved) {
    return selectedAnalysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS
      ? selectedAnalyses.filter(
          (selectedType) =>
            selectedType !== analysisTypes.PALM_RISK &&
            selectedType !== analysisTypes.FOREST_CHANGE_DIAGNOSTICS
        )
      : selectedAnalyses.filter((selectedType) => selectedType !== selectedAnalysisId);
  } else {
    return selectedAnalysisId === analysisTypes.PALM_RISK
      ? [...selectedAnalyses, analysisTypes.PALM_RISK, analysisTypes.FOREST_CHANGE_DIAGNOSTICS]
      : [...selectedAnalyses, selectedAnalysisId];
  }
};

function AnalysisTypesSelector({
  selectedAnalyses,
  setSelectedAnalyses,
  commodity,
  isPalmOilBackwardComp,
}) {
  const handleAnalyzesSelection = (selectedAnalysisId) => {
    setSelectedAnalyses(getUpdatedSelection(selectedAnalyses, selectedAnalysisId));
  };

  const analysisOptions =
    commodity === 'OILP' || isPalmOilBackwardComp
      ? [...analysisTypesForUI, palmRiskAnalysis]
      : analysisTypesForUI;

  return (
    <ThemeProvider>
      <FormGroup className="analysis-types-selector">
        <Typography variant="h5">{locationsPage.upload.analysis}</Typography>
        <Typography variant="caption">
          Select which type(s) of data analysis you'd like to be available for this list. Note that
          analysis processing counts towards your account usage limits. See more information{' '}
          <Link href="/about?section=Fees" underline="none">
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
                />
              }
              sx={{ mr: 0, mb: 1.5, ml: id === analysisTypes.PALM_RISK ? 2 : 0 }}
              label={
                <>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1">{label}</Typography>
                    {id === 'AFI' && <BetaTag>(PREVIEW)</BetaTag>}
                  </Box>
                  {description && <Typography variant="caption">{description}</Typography>}
                </>
              }
            />
          </div>
        ))}
      </FormGroup>
    </ThemeProvider>
  );
}

export default AnalysisTypesSelector;
