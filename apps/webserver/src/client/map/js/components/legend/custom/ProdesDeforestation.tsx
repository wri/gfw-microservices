import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { MapReducerRootState } from '../../../reducers/mapReducerTypes';
import { mapPage } from '../../../../../common/js/config';
import { UPDATE_PRODES_DEFORESTATION_FILTER } from '../../../constants/actionTypes';
import { YearRangeSlider } from '../../../../../components';

interface ProdesDeforestationProps {
  disabled?: string;
}

export const ProdesDeforestation = ({ disabled }: ProdesDeforestationProps) => {
  const dispatch = useDispatch();
  const isDisabled = Boolean(disabled);

  const prodesDeforestationFilter = useSelector(
    (state: MapReducerRootState) => state.prodesDeforestationFilter
  );

  const { prodesLossYears } = mapPage;
  const minYear = prodesLossYears[0];
  const maxYear = prodesLossYears[prodesLossYears.length - 1];

  const { startYear, endYear } = prodesDeforestationFilter;

  const updateProdesFilter = (newStartYear: number, newEndYear: number) => {
    if (isDisabled) {
      return;
    }

    dispatch({
      type: UPDATE_PRODES_DEFORESTATION_FILTER,
      payload: { startYear: newStartYear, endYear: newEndYear },
    });
  };

  return (
    <Box sx={{ mr: 2.5, mt: 2 }}>
      <YearRangeSlider
        startYear={startYear}
        endYear={endYear}
        minYear={minYear}
        maxYear={maxYear}
        marks={[
          { value: minYear, label: String(minYear) },
          { value: maxYear, label: String(maxYear) },
        ]}
        disabled={isDisabled}
        onYearChange={updateProdesFilter}
        sliderSx={{
          '& .MuiSlider-markLabel:first-of-type': {
            left: '3%',
          },
          '& .MuiSlider-markLabel:last-of-type': {
            left: '70%',
          },
        }}
      />
    </Box>
  );
};
