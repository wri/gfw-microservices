import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Card, Grid, Radio } from '@mui/material';
import HectareKilometerSwitch from './HectareKilometerSwitch';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import AreaSelectionHelpInformation from './AreaSelectionHelpInformation';
import { NEW_LOCATION_AREA_OPTIONS } from './areaOptions.constants';
import { locationsPage } from '../../../../common/js/config';
import './SetArea.scss';

const GfwRadio = withStyles({
  root: {
    color: '#97bd3d',
    '&$checked': {
      color: '#97bd3d',
    },
  },
  checked: {},
})((props) => <Radio color="default" {...props} />);

const SetArea = ({
  setArea = () => {
    return;
  }, // this function from AddLocation calculates the area from the geometry but it's not needed in the PolygonCoordinatesInput component
  setCustomArea, // sets the custom area value, number type
  customArea,
  setMeasurementUnit, // sets the selected unit kilometeres / hectares
  measurementUnit,
  setSelectedAreaRadioOption, // sets the selected radio option (small, medium, large, custom)
  selectedAreaRadioOption,
  calculatedArea, // calculated area when the input is a radius in km
}) => {
  const { add } = locationsPage;
  const {
    customRadiusLabel,
    customAreaLabel,
    defineRadiusHeader,
    calculatedSourcingArea,
    customAreaPlaceholder,
  } = add;
  return (
    <div style={{ maxWidth: '500px', marginTop: '20px' }}>
      <Grid container className="set-area" spacing={2}>
        <Grid item xs={12}>
          <label>{defineRadiusHeader}</label>
        </Grid>
        {Object.values(NEW_LOCATION_AREA_OPTIONS).map(({ id, label, hint }) => (
          <React.Fragment key={id}>
            <Grid item xs={1}>
              <GfwRadio
                type="radio"
                className="set-area__radio-input"
                checked={selectedAreaRadioOption === id}
                value={label}
                data-testid={`${id}-radius-option`}
                onClick={(evt) => {
                  setSelectedAreaRadioOption(id);
                  setArea(evt.target.id, '');
                }}
              />
            </Grid>
            <Grid item xs={5}>
              <div>{label}</div>
              <div className="set-area__radio-label-description">{hint}</div>
            </Grid>
          </React.Fragment>
        ))}

        {selectedAreaRadioOption === NEW_LOCATION_AREA_OPTIONS.CUSTOM.id && (
          <Grid item xs={12}>
            <Card sx={{ background: '#f7f7f7', padding: '20px 40px' }}>
              <label>{customAreaPlaceholder}</label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  margin: '10px 0px',
                }}
              >
                <input
                  type="number"
                  value={customArea}
                  data-testid="polygoon-coordinates-custom-area-input"
                  placeholder={
                    measurementUnit === 'kilometers' ? customRadiusLabel : customAreaLabel
                  }
                  onChange={(e) => setCustomArea(e.target.value)}
                />
                <HectareKilometerSwitch
                  setMeasurementUnit={setMeasurementUnit}
                  measurementUnit={measurementUnit}
                />
              </div>

              {measurementUnit === 'kilometers' && customArea && calculatedArea && (
                <div style={{ marginBottom: '10px' }}>
                  {`${calculatedSourcingArea}: ${numberWithCommas(calculatedArea)}`}
                </div>
              )}

              <AreaSelectionHelpInformation measurementUnit={measurementUnit} />
            </Card>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default SetArea;
