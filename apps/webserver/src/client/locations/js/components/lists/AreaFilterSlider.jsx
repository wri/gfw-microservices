import React, { useEffect, useState } from 'react';
import Slider from '@material-ui/core/Slider';
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { prettifyNum } from '../../../../common/js/utils/diagnostics.utils';
import { defaultMaximumAreaSizeForLocationsFilter } from '../../../../common/js/constants/lists.constants';

const muiTheme = createTheme({
  overrides: {
    MuiSlider: {
      root: {
        width: '90%',
        margin: '20px',
      },
      thumb: {
        color: '#97bd3d',
      },
      track: {
        color: '#97bd3d',
      },
      rail: {
        color: '#97bd3d',
      },
      valueLabel: {
        '& > span > span': {
          color: 'black',
        },
      },
    },
  },
});

function AreaFilterSlider({
  onChange,
  value,
  maximumAnalysisAreaInTheList = defaultMaximumAreaSizeForLocationsFilter,
}) {
  const [roundedMaximumArea, setRoundedMaximumAnalysisAreaInTheList] = useState(
    defaultMaximumAreaSizeForLocationsFilter
  );
  const [marks, setMarks] = useState([]);
  useEffect(() => {
    const relevantDigits = 10 ** (maximumAnalysisAreaInTheList.toString().split('.')[0].length - 1);
    const roundedArea = Math.ceil(maximumAnalysisAreaInTheList / relevantDigits) * relevantDigits;

    setRoundedMaximumAnalysisAreaInTheList(roundedArea);
    setMarks([
      {
        value: 0,
        label: '0 ha',
      },
      {
        value: roundedArea,
        label: `${prettifyNum(roundedArea)} ha`,
      },
    ]);
  }, [maximumAnalysisAreaInTheList]);

  // if the maximum area is not set (value[1]), use the rounded maximum area size on the list
  // so the slider by default is not filtering any location
  const valueWithRoundedDefaultMaximumArea = [value[0], value[1] || roundedMaximumArea];

  return (
    <ThemeProvider theme={muiTheme}>
      <div style={{ textAlign: 'center' }}>
        <Slider
          onChange={onChange}
          defaultValue={valueWithRoundedDefaultMaximumArea}
          value={valueWithRoundedDefaultMaximumArea}
          min={0}
          max={roundedMaximumArea}
          valueLabelDisplay="auto"
          marks={marks}
        />
      </div>
    </ThemeProvider>
  );
}

export default AreaFilterSlider;
