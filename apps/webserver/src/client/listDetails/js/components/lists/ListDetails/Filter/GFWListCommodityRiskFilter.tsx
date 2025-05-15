import { useState, FC } from 'react';
import {
  Select,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import {
  setFilterCount,
  toggleCanopyModal,
  updateFilters,
} from '../../../../../../locations/js/actions/locationActions';
import { PillButton } from '../../../../../../components';
import CommodityRiskFilters from './CommodityRiskFilters';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import filterCountryStateAndSubStateOptions from './filterCountryStateAndSubStateOptions';
import { boxStyle, selectStyle } from './filterStyles';
import store from '../../../../../../locations/js/store';
import { DefaultFilterValues } from '../../DefaultFilterValuesType';
import { defaultFilterValues } from '../../defaultFilterValues';
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
  parentCompanyOptionsForFilter: any[];
  isFilterModalVisible: boolean;
  filterCount: number;
  clearFilters: () => void;
  isListFiltered: boolean;
}
const GFWListCommodityRiskFilter: FC<GFWListCommodityRiskFilterProps> = ({
  filterValues,
  parentCompanyOptionsForFilter,
  isFilterModalVisible,
  clearFilters,
  isListFiltered,
}) => {
  const filters = store.getState().filters;
  const initialState: DefaultFilterValues = {
    ...filters,
    selectedOverallThreats: filters.selectedOverallThreats || [],
    selectedOverallValues: filters.selectedOverallValues || [],
    selectedMillPriority: filters.selectedMillPriority || [],
  };

  const [state, setState] = useState<DefaultFilterValues>(initialState);
  const clearFiltersAndState = () => {
    clearFilters();
    setState(defaultFilterValues);
  };

  const onCountryChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedCountry: evt.target.value,
      selectedState: '',
      selectedSubState: '',
      selectedParentCompany: '',
    }));
  };

  const onStateChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedState: evt.target.value,
      selectedSubState: '',
      selectedParentCompany: '',
    }));
  };

  const onSubStateChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedSubState: evt.target.value,
      selectedParentCompany: '',
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

  const handleCheckboxChange = (key: keyof DefaultFilterValues, value: string) => {
    setState((prevState) => {
      const currentList = Array.isArray(prevState[key]) ? prevState[key] : []; // makes sure it's and array
      const updatedList = currentList.includes(value)
        ? currentList.filter((item) => item !== value) // delete value if already set
        : [...currentList, value]; // adds value if not present

      return { ...prevState, [key]: updatedList };
    });
  };

  const updateValues = () => {
    let newFilterCount = 0;
    Object.keys(state).forEach((key) => {
      if (
        (key === 'selectedCountry' && state[key as keyof DefaultFilterValues] !== '') ||
        (key === 'selectedState' && state[key as keyof DefaultFilterValues] !== '') ||
        (key === 'selectedSubState' && state[key as keyof DefaultFilterValues] !== '') ||
        (key === 'showRSPOCertified' && state[key as keyof DefaultFilterValues]) ||
        (key === 'selectedParentCompany' && state[key as keyof DefaultFilterValues] !== '')
      ) {
        newFilterCount++;
      }
    });

    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(state));
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

  const matchesParentCompanyCriteria = (location: Location) => {
    return (
      (!state.selectedCountry || state.selectedCountry === location.country) &&
      (!state.selectedState || state.selectedState === location.state) &&
      (!state.selectedSubState || state.selectedSubState === location.subState) &&
      (!state.showRSPOCertified || location.certification === 'RSPO')
    );
  };

  const {
    selectedCountry,
    selectedState,
    selectedSubState,
    selectedParentCompany,
    showRSPOCertified,
    selectedOverallThreats,
    selectedMillPriority,
    selectedOverallValues,
  } = state;

  const filteredParentCompanyOptions = parentCompanyOptionsForFilter
    ?.filter((location: Location) => matchesParentCompanyCriteria(location))
    ?.slice(0, 400);

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

          <CommodityRiskFilters
            selectedOverallThreats={selectedOverallThreats}
            selectedOverallValues={selectedOverallValues}
            selectedMillPriority={selectedMillPriority}
            handleCheckboxChange={handleCheckboxChange}
          />

          <Grid
            item
            xs={12}
            sx={{
              justifyContent: 'flex-end',
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <PillButton variant="contained" sx={{ ml: 1 }} onClick={onCloseHandler}>
              Cancel
            </PillButton>
            {isListFiltered && (
              <PillButton
                variant="contained"
                color="info"
                sx={{ ml: 1 }}
                onClick={clearFiltersAndState}
              >
                Clear
              </PillButton>
            )}

            <PillButton variant="contained" sx={{ ml: 1 }} onClick={updateValues}>
              Apply
            </PillButton>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default GFWListCommodityRiskFilter;
