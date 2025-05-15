import { useState, FC } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Modal,
  Autocomplete,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import store from '../../../../../../locations/js/store';
import { boxStyle, selectStyle } from './filterStyles';
import { DefaultFilterValues } from '../../DefaultFilterValuesType';
import '../../../../../../common/css/filter-dialogs.scss';

import Button from '../../../../../../common/js/components/Button';

interface AdministrativeAreasGFWListFilterProps {
  adminAreas: { Country: string; State: string; 'Sub State'?: string }[];
  isFilterModalVisible: boolean;
}

const AdministrativeAreasGFWListFilter: FC<AdministrativeAreasGFWListFilterProps> = ({
  adminAreas,
  isFilterModalVisible,
}) => {
  const initialState: DefaultFilterValues = store.getState().filters;
  const [state, setState] = useState<DefaultFilterValues>(initialState);

  const onCountryChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedCountry: evt.target.value,
      selectedStates: [],
      selectedSubStates: [],
    }));
  };

  const onStateChange = (event: any, newValue: any[]) => {
    setState((prevState) => ({
      ...prevState,
      selectedStates: newValue.map((s) => s.value),
      selectedSubStates: [],
    }));
  };

  const onSubStateChange = (event: any, newValue: any[]) => {
    setState((prevState) => ({
      ...prevState,
      selectedSubStates: newValue.map((s) => s.value),
    }));
  };

  const updateValues = () => {
    let filterCount = 0;
    Object.keys(state).forEach((key) => {
      if (key === 'selectedCountry' && state[key] !== '') {
        filterCount++;
      } else if (
        (key === 'selectedStates' || key === 'selectedSubStates') &&
        state[key].length > 0
      ) {
        filterCount++;
      }
    });
    const filters = {
      selectedCountry: state.selectedCountry,
      selectedStates: state.selectedStates,
      selectedSubStates: state.selectedSubStates,
    };
    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(filters));
    store.dispatch(setFilterCount(filterCount));
  };

  const onCloseHandler = () => {
    setState(initialState);
    store.dispatch(toggleCanopyModal());
  };

  const countries = Array.from(
    new Set(adminAreas.filter((location) => location.Country !== '')?.map((list) => list.Country))
  ).sort();

  const statesOptions = Array.from(
    new Set(
      adminAreas
        .filter((location) => location.Country === state.selectedCountry && location.State !== '')
        ?.map((list) => list.State)
    )
  )
    .sort()
    .map((v) => ({ label: v, value: v }));

  const subStatesOptions = adminAreas
    .filter(
      (area) =>
        area.Country === state.selectedCountry &&
        area?.['Sub State']?.trim().length &&
        state.selectedStates.includes(area.State)
    )
    .map((area) => area['Sub State']!)
    .sort()
    .map((v) => ({ label: v, value: v }));

  const isCountrySetInFilter = !!store.getState().filters?.selectedCountry;
  const isCountrySetInState = !!state?.selectedCountry;

  return (
    <Modal open={isFilterModalVisible} onClose={onCloseHandler}>
      <Box sx={boxStyle}>
        <h3>Show Administrative Areas for</h3>

        <FormControl sx={selectStyle}>
          <InputLabel id="country-select-label">
            Country <span style={{ color: 'red', fontSize: '1.5rem' }}>*</span>
          </InputLabel>
          <Select
            labelId="country-select-label"
            id="country_select"
            value={state.selectedCountry || ''}
            onChange={onCountryChange}
            label="Country"
          >
            {countries.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div style={{ margin: '10px 0px' }}>
          <FormControl sx={selectStyle} disabled={!statesOptions.length}>
            <Autocomplete
              multiple
              options={statesOptions || []}
              getOptionLabel={(option) => option.label}
              value={state.selectedStates?.map((v) => ({ value: v, label: v })) || []}
              filterSelectedOptions
              onChange={onStateChange}
              renderInput={(params) => <TextField {...params} label="States" />}
              disabled={!statesOptions.length}
            />
          </FormControl>
        </div>
        <div style={{ margin: '10px 0px' }}>
          <FormControl sx={selectStyle} disabled={!subStatesOptions.length}>
            <Autocomplete
              multiple
              options={subStatesOptions || []}
              getOptionLabel={(option) => option.label}
              value={state.selectedSubStates?.map((v) => ({ value: v, label: v })) || []}
              filterSelectedOptions
              onChange={onSubStateChange}
              renderInput={(params) => <TextField {...params} label="Sub States" />}
              disabled={!subStatesOptions.length}
            />
          </FormControl>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            margin: '10px 0px',
          }}
        >
          {isCountrySetInFilter && (
            <Button variant="secondary" onClick={onCloseHandler} label="Cancel" />
          )}
          <Button
            style={{ marginLeft: '10px' }}
            variant="primary"
            disabled={!isCountrySetInState}
            onClick={updateValues}
            label="Apply"
          />
        </div>
      </Box>
    </Modal>
  );
};

export default AdministrativeAreasGFWListFilter;
