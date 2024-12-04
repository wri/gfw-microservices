import React from 'react';
import { Typography, Box, Link, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { ThemeProvider } from '../../../../styles/ThemeProvider';
import { locationsPage } from '../../config';
import { analysisTypesOptions } from '../../../../../config/env/analysisTypes.constants';
import BetaTag from '../BetaTag';
import './AnalysisTypesSelector.scss';

function AnalysisTypesSelector({ selectedAnalyses, setSelectedAnalyses }) {
  const handleAnalyzesSelection = (selectedAnalysisId) => {
    let selection;
    if (selectedAnalyses.includes(selectedAnalysisId)) {
      selection = selectedAnalyses.filter((selectedType) => selectedType !== selectedAnalysisId);
    } else {
      selection = [...selectedAnalyses, selectedAnalysisId];
    }
    setSelectedAnalyses(selection);
  };

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
        {analysisTypesOptions.map(({ id, label, description }) => (
          <div key={id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAnalyses.includes(id)}
                  onChange={() => handleAnalyzesSelection(id)}
                />
              }
              style={{ marginRight: 0, marginBottom: 15 }}
              label={
                <>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1">{label}</Typography>
                    {id === 'AFI' && <BetaTag>(PREVIEW)</BetaTag>}
                  </Box>
                  <Typography variant="caption">{description}</Typography>
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
