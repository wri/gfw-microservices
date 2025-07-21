import { Typography, Box, Link, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { ThemeProvider } from '../../../../styles/ThemeProvider';
import { locationsPage } from '../../config';
import {
  analysisTypes,
  analysisTypesForUI,
  palmRiskAnalysis,
} from '../../../../../config/env/analysisTypes.constants';
import { HelperTextWithPopover } from '../../../../components';

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
    return [...selectedAnalyses, selectedAnalysisId];
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
                    id === analysisTypes.PALM_RISK &&
                    !selectedAnalyses.includes(analysisTypes.FOREST_CHANGE_DIAGNOSTICS)
                  }
                />
              }
              sx={{ mr: 0, mb: 1.5, ml: id === analysisTypes.PALM_RISK ? 2 : 0 }}
              label={
                <Box
                  sx={{ '&:hover': { cursor: 'default' } }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
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
                            Our services do not provide certification or guarantee that any
                            deforestation-related activities, data, or supply chains comply with the
                            European Union Deforestation Regulation (EUDR). Compliance with EUDR
                            requirements remains the sole responsibility of the relevant parties,
                            and we recommend consulting with appropriate legal and regulatory
                            experts for verification and certification.
                          </Typography>
                        </Box>
                      </HelperTextWithPopover>
                    )}
                  </Box>
                  {description && <Typography variant="caption">{description}</Typography>}
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
