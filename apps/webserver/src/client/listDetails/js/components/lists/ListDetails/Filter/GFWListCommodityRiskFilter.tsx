import React, { useEffect, useState } from 'react';
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
  setFilterCount,
  toggleCanopyModal,
  updateFilters,
} from '../../../../../../locations/js/actions/locationActions';
import Button from '../../../../../../common/js/components/Button';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import filterCountryStateAndSubStateOptions from './filterCountryStateAndSubStateOptions';
import { boxStyle, selectStyle } from './filterStyles';
import store from '../../../../../../locations/js/store';
import { DefaultFilterValues } from '../../DefaultFilterValuesType';
import '../../../../../../common/css/filter-dialogs.scss';

interface Location {
  country: string;
  state: string;
  subState: string;
  certification: string;
  parentCompany: string;
  label?: string;
}

interface GFWListCommodityRiskFilterProps {
  list_name: string;
  filterValues: any;
  locationNameOptionsForFilter: Location[];
  parentCompanyOptionsForFilter: any[];
  isFilterModalVisible: boolean;
  filterCount: number;
}
const GFWListCommodityRiskFilter: React.FC<GFWListCommodityRiskFilterProps> = ({
  filterValues,
  locationNameOptionsForFilter,
  parentCompanyOptionsForFilter,
  isFilterModalVisible,
}) => {
  const initialState: DefaultFilterValues = store.getState().filters;
  const [state, setState] = useState<DefaultFilterValues>(initialState);

  const onCountryChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedCountry: evt.target.value,
      selectedState: '',
      selectedSubState: '',
      selectedParentCompany: '',
      selectedNames: [],
    }));
  };

  const onStateChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedState: evt.target.value,
      selectedSubState: '',
      selectedParentCompany: '',
      selectedNames: [],
    }));
  };

  const onSubStateChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedSubState: evt.target.value,
      selectedParentCompany: '',
      selectedNames: [],
    }));
  };
  const changeParentCompany = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedParentCompany: evt.target.value,
    }));
  };

  const changeShowRSPOCertified = () => {
    setState((prevState) => ({
      ...prevState,
      showRSPOCertified: !prevState.showRSPOCertified,
    }));
  };

  /*
  const toggleCheckboxSelection = (key, value) => {
    setState((prevState) => {
      const currentlySelected = [...prevState[key]];
      if (currentlySelected.includes(value)) {
        // Remove item if it exists
        return { [key]: currentlySelected.filter((item) => item !== value) };
      } else {
        // Add item if it doesn't exist
        return { [key]: [...currentlySelected, value] };
      }
    });
  };

  const changeOverallThreats = (evt) => {
    toggleCheckboxSelection('selectedOverallThreats', evt.target.value);
  };

  const changeOverallValues = (evt) => {
    toggleCheckboxSelection('selectedOverallValues', evt.target.value);
  };

  const changeMillPriority = (evt) => {
    toggleCheckboxSelection('selectedMillPriority', evt.target.value);
  };
  */
  const updateValues = () => {
    let newFilterCount = 0;
    Object.keys(state).forEach((key) => {
      if (
        (key === 'selectedCountry' && state[key as keyof DefaultFilterValues] !== '') ||
        (key === 'selectedState' && state[key as keyof DefaultFilterValues] !== '') ||
        (key === 'selectedSubState' && state[key as keyof DefaultFilterValues] !== '') ||
        (key === 'selectedNames' && Object.values(state[key]).length > 0) ||
        (key === 'showRSPOCertified' && state[key as keyof DefaultFilterValues]) ||
        (key === 'selectedParentCompany' && state[key as keyof DefaultFilterValues] !== '')
      ) {
        newFilterCount++;
      }
    });

    const filterData = {
      ...state,
      selectedNames: state.selectedNames.map((n: any) => n.label),
    };
    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(filterData));
    store.dispatch(setFilterCount(newFilterCount));
  };
  const onCloseHandler = () => {
    setState(initialState);
    store.dispatch(toggleCanopyModal());
  };

  const { countryList, stateList, subStateList } = filterCountryStateAndSubStateOptions(
    filterValues,
    state.selectedCountry,
    state.selectedState
  );
  /*
  const passesFilter = (location: Location, filters: any[]) =>
    filters.every(
      ({ key, values }) => values?.length === 0 || checkSelectedFilter(location, key, values)
    );

  const commodityFilters = [
    { key: 'commodity_threat_overall_level', values: state.selectedOverallThreats },
    { key: 'commodity_value_overall_level', values: state.selectedOverallValues },
    { key: 'commodity_mill_priority_level', values: state.selectedMillPriority },
  ];
*/
  const matchesParentCompanyCriteria = (location: Location) => {
    return (
      (!state.selectedCountry || state.selectedCountry === location.country) &&
      (!state.selectedState || state.selectedState === location.state) &&
      (!state.selectedSubState || state.selectedSubState === location.subState) &&
      (!state.showRSPOCertified || location.certification === 'RSPO')
    );
  };
  const onSelectedLocationsChange = (event: any, newValue: any) => {
    setState((prevState) => ({
      ...prevState,
      selectedNames: newValue,
    }));
  };

  const {
    selectedCountry,
    selectedState,
    selectedSubState,
    selectedParentCompany,
    showRSPOCertified,
    selectedNames,
  } = state;

  const filteredParentCompanyOptions = parentCompanyOptionsForFilter
    ?.filter((location: Location) => matchesParentCompanyCriteria(location))
    ?.slice(0, 400);

  const matchesLocationCriteria = (location: Location) => {
    return (
      (state.selectedCountry === '' || state.selectedCountry === location.country) &&
      (state.selectedState === '' || state.selectedState === location.state) &&
      (state.selectedSubState === '' || state.selectedSubState === location.subState) &&
      (state.selectedParentCompany === '' ||
        state.selectedParentCompany === location.parentCompany) &&
      (!state.showRSPOCertified || location.certification === 'RSPO')
    );
  };

  const filteredLocationNameOptions = locationNameOptionsForFilter
    ?.filter((location) => matchesLocationCriteria(location))
    ?.slice(0, 400);

  useEffect(() => {
    // When the filter modal opens, load the previously saved filter state from the store.
    // This allows us to show the last used filter values if the user opens the modal again without saving changes.
    // Since `selectedNames` is stored as an array of strings in the store, we need to map each string to its corresponding
    // option object in `filteredLocationNameOptions`. This ensures `selectedNames` is properly formatted for the multi-select component.
    if (isFilterModalVisible) {
      const selectedNamesWithObjects = initialState.selectedNames?.map((name: any) =>
        locationNameOptionsForFilter.find((option) => option.label === name)
      );

      setState({
        ...initialState,
        selectedNames: selectedNamesWithObjects,
      });
    }
  }, [isFilterModalVisible, locationNameOptionsForFilter, initialState]);

  return (
    <Modal open={isFilterModalVisible} onClose={onCloseHandler}>
      <Box sx={boxStyle}>
        <h3>Filters</h3>
        <Grid container spacing={3}>
          <CountryStateSubStateFilter
            countries={countryList}
            selectedCountry={selectedCountry}
            onCountryChange={onCountryChange}
            states={stateList}
            selectedState={selectedState}
            onStateChange={onStateChange}
            subStates={subStateList}
            selectedSubState={selectedSubState}
            onSubStateChange={onSubStateChange}
          />

          <Grid item xs={4} sx={{ alignItems: 'center', display: 'flex' }}>
            <input
              id="show-RSPO-certified"
              checked={showRSPOCertified}
              onChange={changeShowRSPOCertified}
              type="checkbox"
            />
            <label htmlFor="show-RSPO-certified">Show RSPO Certified</label>
          </Grid>
          <Grid item xs={8}>
            <FormControl sx={selectStyle} disabled={!filteredParentCompanyOptions.length}>
              <InputLabel id="parent-company-select">Parent company</InputLabel>
              <Select
                id="parent-company-select"
                labelId="parent-company-select"
                value={selectedParentCompany}
                onChange={changeParentCompany}
                label="Parent company"
              >
                {filteredParentCompanyOptions.map(({ label, value }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/*            <Grid item xs={12} sx={{ alignItems: 'center' }}>
          <div className="col flex-grid align-center space-between filter-spacer input-field__block-container">
            <span className="label">Overall Threats</span>
            <div className="flex-grid space-between">
              <div>
                <input
                  type="checkbox"
                  id="overall-threats-high"
                  name="overall-threats-selection"
                  value="high"
                  checked={selectedOverallThreats.includes('high')}
                  onChange={this.changeOverallThreats}
                />
                <label className="filter-label" htmlFor="overall-threats-high">
                  {' '}
                  High{' '}
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="overall-threats-medium"
                  name="overall-threats-selection"
                  value="medium"
                  checked={selectedOverallThreats.includes('medium')}
                  onChange={this.changeOverallThreats}
                />
                <label className="filter-label" htmlFor="overall-threats-medium">
                  {' '}
                  Medium{' '}
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="overall-threats-low"
                  name="overall-threats-selection"
                  value="low"
                  checked={selectedOverallThreats.includes('low')}
                  onChange={this.changeOverallThreats}
                />
                <label className="filter-label" htmlFor="overall-threats-low">
                  {' '}
                  Low{' '}
                </label>
              </div>
            </div>
          </div>
          <div className="col flex-grid align-center space-between filter-spacer input-field__block-container">
            <span className="label">Overall Values</span>
            <div className="flex-grid space-between">
              <div>
                <input
                  type="checkbox"
                  id="overall-values-high"
                  name="overall-values-selection"
                  value="high"
                  checked={selectedOverallValues.includes('high')}
                  onChange={this.changeOverallValues}
                />
                <label htmlFor="overall-values-high" className="filter-label">
                  {' '}
                  High{' '}
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="overall-values-medium"
                  name="overall-values-selection"
                  value="medium"
                  checked={selectedOverallValues.includes('medium')}
                  onChange={this.changeOverallValues}
                />
                <label htmlFor="overall-values-medium" className="filter-label">
                  {' '}
                  Medium{' '}
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="overall-values-low"
                  name="overall-values-selection"
                  value="low"
                  checked={selectedOverallValues.includes('low')}
                  onChange={this.changeOverallValues}
                />
                <label htmlFor="overall-values-low" className="filter-label">
                  {' '}
                  Low{' '}
                </label>
              </div>
            </div>
          </div>
          <div className="col flex-grid align-center space-between filter-spacer input-field__block-container">
            <span className="label">Mill Priority</span>
            <div className="flex-grid space-between">
              <div>
                <input
                  type="checkbox"
                  id="mill-priority-high"
                  name="mill-priority-selection"
                  value="high"
                  checked={selectedMillPriority.includes('high')}
                  onChange={this.changeMillPriority}
                />
                <label htmlFor="mill-priority-high" className="filter-label">
                  {' '}
                  High{' '}
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="mill-priority-medium"
                  name="mill-priority-selection"
                  value="medium"
                  checked={selectedMillPriority.includes('medium')}
                  onChange={this.changeMillPriority}
                />
                <label htmlFor="mill-priority-medium" className="filter-label">
                  {' '}
                  Medium{' '}
                </label>
              </div>
              <div>
                <input
                  type="checkbox"
                  id="mill-priority-low"
                  name="mill-priority-selection"
                  value="low"
                  checked={selectedMillPriority.includes('low')}
                  onChange={this.changeMillPriority}
                />
                <label htmlFor="mill-priority-low" className="filter-label">
                  {' '}
                  Low{' '}
                </label>
              </div>
            </div>
          </div>
        </Grid>*/}

          <Grid item xs={12}>
            <FormControl sx={selectStyle} disabled={!filteredLocationNameOptions.length}>
              <Autocomplete
                multiple
                options={filteredLocationNameOptions || []}
                getOptionLabel={(option) => option.label}
                value={selectedNames?.length ? selectedNames : []}
                filterSelectedOptions
                onChange={onSelectedLocationsChange}
                renderInput={(params) => <TextField {...params} label="LOCATIONS" />}
                disabled={!filteredLocationNameOptions.length}
              />
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              justifyContent: 'flex-end',
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <Button variant="secondary" onClick={onCloseHandler} label="Cancel" />

            <Button
              style={{ marginLeft: '10px' }}
              variant="primary"
              onClick={updateValues}
              label="Apply"
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default GFWListCommodityRiskFilter;
