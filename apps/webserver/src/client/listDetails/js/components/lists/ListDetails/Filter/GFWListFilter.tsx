import { useState, FC } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Modal,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import { PillButton } from '../../../../../../components';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { boxStyle, selectStyle } from './filterStyles';
import filterCountryStateAndSubStateOptions from './filterCountryStateAndSubStateOptions';
import store from '../../../../../../locations/js/store';
import { DefaultFilterValues } from '../../DefaultFilterValuesType';
import { defaultFilterValues } from '../../defaultFilterValues';
import '../../../../../../common/css/filter-dialogs.scss';

interface GFWListFilterProps {
  list_name: string;
  filterValues: any;
  parentCompanyOptionsForFilter: any[];
  isFilterModalVisible: boolean;
  clearFilters: () => void;
  isListFiltered: boolean;
}

const GFWListFilter: FC<GFWListFilterProps> = ({
  list_name,
  filterValues,
  parentCompanyOptionsForFilter,
  isFilterModalVisible,
  clearFilters,
  isListFiltered,
}) => {
  const initialState: DefaultFilterValues = store.getState().filters;
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

  const {
    selectedCountry,
    selectedState,
    selectedSubState,
    selectedParentCompany,
    showRSPOCertified,
  } = state;

  const { countryList, stateList, subStateList } = filterCountryStateAndSubStateOptions(
    filterValues,
    selectedCountry,
    selectedState
  );

  const filteredParentCompanyOptions =
    list_name === 'Palm Oil Mills'
      ? parentCompanyOptionsForFilter
          ?.filter(
            (location) =>
              (selectedCountry === '' || selectedCountry === location.country) &&
              (selectedState === '' || selectedState === location.state) &&
              (selectedSubState === '' || selectedSubState === location.subState) &&
              (!showRSPOCertified || location.certification === 'RSPO')
          )
          ?.slice(0, 400)
      : [];

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

          {list_name === 'Palm Oil Mills' && (
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <input
                  id="show-RSPO-certified"
                  className="dropdown-group__dropdown"
                  checked={showRSPOCertified}
                  onChange={changeShowRSPOCertified}
                  type="checkbox"
                />
                <label htmlFor="show-RSPO-certified">Show RSPO Certified</label>
              </div>

              <FormControl sx={selectStyle} disabled={!filteredParentCompanyOptions.length}>
                <InputLabel id="parent-company-select-label">PARENT COMPANY</InputLabel>
                <Select
                  labelId="parent-company-select-label"
                  value={selectedParentCompany || ''}
                  onChange={changeParentCompany}
                  label="PARENT COMPANY"
                >
                  {filteredParentCompanyOptions.map(({ label, value }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <PillButton variant="contained" color="info" sx={{ ml: 1 }} onClick={onCloseHandler}>
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

export default GFWListFilter;
