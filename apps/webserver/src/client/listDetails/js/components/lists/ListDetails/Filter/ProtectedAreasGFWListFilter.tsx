import React, { useState } from 'react';
import {
  Select,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Grid,
  Autocomplete,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import Button from '../../../../../../common/js/components/Button';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { FilterState } from '../../defaultFilterValues';
import store from '../../../../../../locations/js/store';
import { boxStyle, selectStyle } from './filterStyles';
import '../../../../../../common/css/filter-dialogs.scss';

interface GFWProtectedForestChangeFilterProps {
  protectedAreas: Array<{ [key: string]: string }>;
  isFilterModalVisible: boolean;
}

const GFWProtectedForestChangeFilter: React.FC<GFWProtectedForestChangeFilterProps> = ({
  protectedAreas,
  isFilterModalVisible,
}) => {
  const initialState: FilterState = store.getState().filters;
  const [state, setState] = useState<FilterState>(initialState);

  const onCountryChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    setState({
      ...state,
      selectedCountry: evt.target.value as string,
      selectedState: '',
      selectedSubState: '',
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  const onStateChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    setState({
      ...state,
      selectedState: evt.target.value as string,
      selectedSubState: '',
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  const onSubStateChange = (evt: React.ChangeEvent<{ value: unknown }>) => {
    setState({
      ...state,
      selectedSubState: evt.target.value as string,
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  const onDesignationTypeChange = (evt: SelectChangeEvent<unknown>) => {
    setState({
      ...state,
      selectedDesignationType: evt.target.value as string,
    });
  };

  const onDesignationChange = (evt: SelectChangeEvent<unknown>) => {
    setState({
      ...state,
      selectedDesignation: evt.target.value as string,
    });
  };

  const onProtectedAreasChange = (values: any) => {
    setState({ ...state, selectedNames: values });
  };

  const updateValues = () => {
    let filterCount = 0;
    Object.keys(state).forEach((key) => {
      if (state[key as keyof FilterState]) filterCount++;
    });

    const filters = {
      selectedCountry: state.selectedCountry,
      selectedState: state.selectedState,
      selectedSubState: state.selectedSubState,
      selectedDesignationType: state.selectedDesignationType,
      selectedDesignation: state.selectedDesignation,
      selectedNames: state.selectedNames.map((v) => v.label),
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
    new Set(protectedAreas.map((list) => list.Country).filter(Boolean))
  ).sort();
  const states = Array.from(
    new Set(
      protectedAreas
        .filter((location) => location.Country === state.selectedCountry)
        .map((list) => list.State)
    )
  ).sort();
  const subStates = Array.from(
    new Set(
      protectedAreas
        .filter(
          (location) =>
            location.Country === state.selectedCountry && location.State === state.selectedState
        )
        .map((list) => list['Sub State'])
    )
  ).sort();
  const designationTypeOptions = Array.from(
    new Set(
      protectedAreas
        .filter(
          (location) =>
            location.Country === state.selectedCountry && location.State === state.selectedState
        )
        .map((list) => list['Designation Type'])
    )
  ).sort();
  const designationOptions = Array.from(
    new Set(
      protectedAreas
        .filter(
          (location) =>
            location.Country === state.selectedCountry && location.State === state.selectedState
        )
        .map((list) => list.Designation)
    )
  ).sort();

  const protectedAreasOptions = Array.from(
    new Set(
      protectedAreas
        .filter((location) => location['Location Name'])
        .map((list) => list['Location Name'])
    )
  )
    .sort()
    .map((v) => ({ label: v, value: v }));

  const isCountrySetInFilter = !!store.getState().filters?.selectedCountry;
  const isCountrySetInState = !!state?.selectedCountry;

  return (
    <Modal open={isFilterModalVisible} onClose={onCloseHandler}>
      <Box sx={boxStyle}>
        <h3>Show Protected Areas for</h3>
        <Grid container spacing={3}>
          <CountryStateSubStateFilter
            countries={countries}
            selectedCountry={state.selectedCountry}
            onCountryChange={onCountryChange}
            states={states}
            selectedState={state.selectedState}
            onStateChange={onStateChange}
            subStates={subStates}
            selectedSubState={state.selectedSubState}
            onSubStateChange={onSubStateChange}
          />
          <Grid item xs={6}>
            <FormControl sx={selectStyle}>
              <InputLabel id="designation-type">Designation Type</InputLabel>
              <Select
                id="designation-type"
                value={state.selectedDesignationType}
                onChange={onDesignationTypeChange}
                label="Designation Type"
              >
                {designationTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl sx={selectStyle}>
              <InputLabel id="designation">Designation</InputLabel>
              <Select
                id="designation"
                value={state.selectedDesignation}
                onChange={onDesignationChange}
                label="Designation"
              >
                {designationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl sx={selectStyle}>
              <Autocomplete
                multiple
                options={protectedAreasOptions || []}
                getOptionLabel={(option) => option.label}
                value={state.selectedSubStates?.map((v) => ({ value: v, label: v })) || []}
                filterSelectedOptions
                onChange={onProtectedAreasChange}
                renderInput={(params) => <TextField {...params} label="Sub States" />}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ justifyContent: 'flex-end', display: 'flex' }}>
            <Button
              variant="secondary"
              onClick={onCloseHandler}
              disabled={!isCountrySetInFilter}
              label="Cancel"
            />
            <Button
              variant="primary"
              onClick={updateValues}
              disabled={!isCountrySetInState}
              label="Apply"
              style={{ marginLeft: '10px' }}
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default GFWProtectedForestChangeFilter;
