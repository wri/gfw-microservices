import { ChangeEvent } from 'react';
import { Grid, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { DefaultFilterValues } from '../../DefaultFilterValuesType';

interface CommodityRiskFiltersProps {
  selectedOverallThreats: string[];
  selectedOverallValues: string[];
  selectedMillPriority: string[];
  handleCheckboxChange: (key: keyof DefaultFilterValues, value: string) => void;
}

function CommodityRiskFilters({
  selectedOverallThreats,
  selectedOverallValues,
  selectedMillPriority,
  handleCheckboxChange,
}: CommodityRiskFiltersProps) {
  const changeOverallThreats = (evt: ChangeEvent<HTMLInputElement>) => {
    handleCheckboxChange('selectedOverallThreats', evt.target.value);
  };

  const changeOverallValues = (evt: ChangeEvent<HTMLInputElement>) => {
    handleCheckboxChange('selectedOverallValues', evt.target.value);
  };

  const changeMillPriority = (evt: ChangeEvent<HTMLInputElement>) => {
    handleCheckboxChange('selectedMillPriority', evt.target.value);
  };
  return (
    <>
      <Grid item xs={12}>
        <FormGroup row>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <span className="label">Mill Priority</span>
          </Grid>

          <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMillPriority.includes('high')}
                  onChange={changeMillPriority}
                  value="high"
                />
              }
              label="High"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMillPriority.includes('medium')}
                  onChange={changeMillPriority}
                  value="medium"
                />
              }
              label="Medium"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMillPriority.includes('low')}
                  onChange={changeMillPriority}
                  value="low"
                />
              }
              label="Low"
            />
          </Grid>
        </FormGroup>
      </Grid>
      <Grid item xs={12}>
        <FormGroup row>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <span className="label">Overall Threats</span>
          </Grid>

          <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOverallThreats.includes('high')}
                  onChange={changeOverallThreats}
                  value="high"
                />
              }
              label="High"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOverallThreats.includes('medium')}
                  onChange={changeOverallThreats}
                  value="medium"
                />
              }
              label="Medium"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOverallThreats.includes('low')}
                  onChange={changeOverallThreats}
                  value="low"
                />
              }
              label="Low"
            />
          </Grid>
        </FormGroup>
      </Grid>

      <Grid item xs={12}>
        <FormGroup row>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <span className="label">Overall Values</span>
          </Grid>

          <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOverallValues.includes('high')}
                  onChange={changeOverallValues}
                  value="high"
                />
              }
              label="High"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOverallValues.includes('medium')}
                  onChange={changeOverallValues}
                  value="medium"
                />
              }
              label="Medium"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOverallValues.includes('low')}
                  onChange={changeOverallValues}
                  value="low"
                />
              }
              label="Low"
            />
          </Grid>
        </FormGroup>
      </Grid>
    </>
  );
}

export default CommodityRiskFilters;
