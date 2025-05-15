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
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import { PillButton } from '../../../../../../components';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { getFilterCounter } from '../../../../../../locations/js/utils/lists.utils';
import { DefaultFilterValues } from '../../DefaultFilterValuesType';
import { defaultFilterValues } from '../../defaultFilterValues';
import filterCountryStateAndSubStateOptions from './filterCountryStateAndSubStateOptions';
import { boxStyle, selectStyle } from './filterStyles';
import CommodityRiskFilters from './CommodityRiskFilters';
import store from '../../../../../../locations/js/store';
import '../../../../../../common/css/filter-dialogs.scss';

interface Location {
  country: string;
  state: string;
  subState: string;
  certification: string;
  parentCompany: string;
  supplierName?: string;
  secondSupplierName?: string;
  label?: string;
  value?: string;
}

interface UserListCommodityRiskFilterProps {
  isFilterModalVisible: boolean;
  filterValues: DefaultFilterValues;
  parentCompanyOptionsForFilter: Location[];
  supplierNameOptionsForFilter: Location[];
  secondSupplierNameOptionsForFilter: Location[];
  clearFilters: () => void;
  isListFiltered: boolean;
}

const UserListCommodityRiskFilter: FC<UserListCommodityRiskFilterProps> = ({
  isFilterModalVisible,
  filterValues,
  parentCompanyOptionsForFilter,
  supplierNameOptionsForFilter,
  secondSupplierNameOptionsForFilter,
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
      selectedSupplier: '',
      selectedSecondSupplier: '',
    }));
  };

  const onStateChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedState: evt.target.value,
      selectedSubState: '',
      selectedParentCompany: '',
      selectedSupplier: '',
      selectedSecondSupplier: '',
    }));
  };

  const onSubStateChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({
      ...prevState,
      selectedSubState: evt.target.value,
      selectedParentCompany: '',
      selectedSupplier: '',
      selectedSecondSupplier: '',
    }));
  };

  const changeSupplier = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({ ...prevState, selectedSupplier: evt.target.value }));
  };

  const changeSecondSupplier = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({ ...prevState, selectedSecondSupplier: evt.target.value }));
  };

  const onParentCompanyChange = (evt: SelectChangeEvent<string>) => {
    setState((prevState) => ({ ...prevState, selectedParentCompany: evt.target.value }));
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

  const changeShowRSPOCertified = () => {
    setState((prevState) => ({
      ...prevState,
      showRSPOCertified: !prevState.showRSPOCertified,
      selectedParentCompany: '',
      selectedSupplier: '',
      selectedSecondSupplier: '',
    }));
  };

  const updateValues = () => {
    const counter = getFilterCounter(state);
    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(state));
    store.dispatch(setFilterCount(counter));
    gtag('event', 'list table filter', {
      event_category: 'Lists Click',
      event_label: 'user filtered the lists table',
    });
  };

  const onCloseHandler = () => {
    setState(initialState);
    store.dispatch(toggleCanopyModal());
  };
  const {
    selectedCountry,
    selectedState,
    selectedSubState,
    selectedSupplier,
    selectedSecondSupplier,
    selectedParentCompany,
    showRSPOCertified,
    selectedOverallThreats,
    selectedOverallValues,
    selectedMillPriority,
  } = state;

  const { countryList, stateList, subStateList } = filterCountryStateAndSubStateOptions(
    filterValues,
    selectedCountry,
    selectedState
  );

  const matchesCountryCriteria = (location: Location) => {
    return (
      (!state.selectedCountry || state.selectedCountry === location.country) &&
      (!state.selectedState || state.selectedState === location.state) &&
      (!state.selectedSubState || state.selectedSubState === location.subState) &&
      (!state.showRSPOCertified || location.certification === 'RSPO')
    );
  };

  const filteredSupplierNameOptions = supplierNameOptionsForFilter?.filter((location: Location) =>
    matchesCountryCriteria(location)
  );

  const filteredSecondSupplierOptions = secondSupplierNameOptionsForFilter?.filter(
    (location: Location) => matchesCountryCriteria(location)
  );

  const filteredParentCompanyOptions = parentCompanyOptionsForFilter
    ?.filter((location: Location) => matchesCountryCriteria(location))
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

          <Grid item xs={12}>
            <FormControl sx={selectStyle} disabled={!filteredSupplierNameOptions.length}>
              <InputLabel id="supplier-select">Supplier</InputLabel>
              <Select
                labelId="supplier-select"
                value={selectedSupplier || ''}
                onChange={changeSupplier}
                label="Supplier"
              >
                {filteredSupplierNameOptions.map(({ label, value }: Location) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl sx={selectStyle} disabled={!filteredSecondSupplierOptions.length}>
              <InputLabel id="second-supplier-select">Second Supplier</InputLabel>
              <Select
                id="second-supplier-select"
                labelId="second-supplier-select"
                value={selectedSecondSupplier || ''}
                onChange={changeSecondSupplier}
                label="Second Supplier"
              >
                {filteredSecondSupplierOptions.map(({ label, value }: Location) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
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
            <div>
              <input
                id="show-RSPO-certified"
                checked={showRSPOCertified}
                onChange={changeShowRSPOCertified}
                type="checkbox"
              />
              <label htmlFor="show-RSPO-certified">Show RSPO Certified</label>
            </div>
            <FormControl sx={selectStyle} disabled={!filteredParentCompanyOptions.length}>
              <InputLabel id="parent-company-select">Parent Company</InputLabel>
              <Select
                id="parent-company-select"
                labelId="parent-company-select"
                value={selectedParentCompany || ''}
                onChange={onParentCompanyChange}
                label="Parent Company"
              >
                {filteredParentCompanyOptions.map(({ label, value }: Location) => (
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

export default UserListCommodityRiskFilter;
