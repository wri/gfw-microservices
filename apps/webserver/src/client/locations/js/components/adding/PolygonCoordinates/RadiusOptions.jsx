import React from 'react';
import { FormControl, Card, Grid, Divider, Radio, CardContent, Typography } from '@mui/material';
import { withStyles } from '@material-ui/core/styles';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HectareKilometerSwitch from './HectareKilometerSwitch';
import './RadiusOptions.scss';

const GfwRadio = withStyles({
  root: {
    color: '#97bd3d',
    '&$checked': {
      color: '#97bd3d',
    },
  },
  checked: {},
})((props) => <Radio color="default" {...props} />);

const RadiusOptions = ({
  selectedRadius,
  setSelectedRadius,
  customRadiusSize,
  setCustomRadiusSize,
  areaUnit,
  setAreaUnit,
}) => {
  const handleCustomInputChange = (event) => {
    setCustomRadiusSize(event.target.value);
  };
  const showCustomForm = selectedRadius === 'custom';
  return (
    <FormControl>
      <Grid container className="radius-options" spacing={2}>
        <Grid item xs={12} style={{ marginTop: '30px' }}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <label>Set the radius around the location</label>
        </Grid>
        <Grid item xs={1}>
          <GfwRadio
            className="radius-options__radio-input"
            checked={selectedRadius === 'small'}
            value="small"
            name="radio-buttons"
            onClick={() => setSelectedRadius('small')}
          />
        </Grid>
        <Grid item xs={5}>
          <div>Small</div>
          <div className="radius-options__radio-label-description">
            1000 hectares (1.78 km radius)
          </div>
        </Grid>
        <Grid item xs={1}>
          <GfwRadio
            type="radio"
            className="radius-options__radio-input"
            checked={selectedRadius === 'medium'}
            value="medium"
            name="radio-buttons"
            onClick={() => setSelectedRadius('medium')}
          />
        </Grid>
        <Grid item xs={5}>
          <div>Medium</div>
          <div className="radius-options__radio-label-description">
            5000 hectares (3.99 km radius)
          </div>
        </Grid>
        <Grid item xs={1}>
          <GfwRadio
            checked={selectedRadius === 'big'}
            value="big"
            name="radio-buttons"
            onClick={() => setSelectedRadius('big')}
          />
        </Grid>
        <Grid item xs={5}>
          <div>Big</div>
          <div className="radius-options__radio-label-description">
            20000 hectares (7.98 km radius)
          </div>
        </Grid>
        <Grid item xs={1}>
          <GfwRadio
            checked={selectedRadius === 'custom'}
            value="custom"
            name="radio-buttons"
            data-testid="custom-radius-option"
            onClick={() => setSelectedRadius('custom')}
          />
        </Grid>
        <Grid item xs={5}>
          <div>Custom</div>
          <div className="radius-options__radio-label-description">Custom Radius</div>
        </Grid>
        {showCustomForm && (
          <Grid item xs={12}>
            <Card sx={{ background: '#f7f7f7', padding: '20px 40px' }}>
              <label>Set custom area (in hectares) or radius (in km)</label>
              <input
                type="number"
                value={customRadiusSize}
                onChange={handleCustomInputChange}
                placeholder="Custom Value"
                style={{ marginTop: '5px' }}
              />
              <HectareKilometerSwitch areaUnit={areaUnit} setAreaUnit={setAreaUnit} />
              <Card sx={{ background: '#e3eff5' }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    <LightbulbIcon style={{ color: '#6da8c9' }} /> Help
                  </Typography>
                  <Typography sx={{ mb: 1.5 }}>Suggested areas are:</Typography>
                  <Typography variant="body2">
                    <ul>
                      <li>785,000 ha for palm oil mills</li>
                      <li>283,000 ha for soybean silos</li>
                      <li>80-102,000 ha for cocoa warehouses</li>
                    </ul>
                  </Typography>
                </CardContent>
              </Card>
            </Card>
          </Grid>
        )}
      </Grid>
    </FormControl>
  );
};

export default RadiusOptions;
