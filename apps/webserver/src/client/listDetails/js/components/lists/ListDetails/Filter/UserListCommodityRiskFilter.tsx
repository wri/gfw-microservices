import { useState, FC } from 'react';
import { Box, Modal, Grid, SelectChangeEvent } from '@mui/material';
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
import { boxStyle } from './filterStyles';
import CommodityRiskFilters from './CommodityRiskFilters';
import store from '../../../../../../locations/js/store';
import '../../../../../../common/css/filter-dialogs.scss';

interface UserListCommodityRiskFilterProps {
  isFilterModalVisible: boolean;
  filterValues: DefaultFilterValues;
  clearFilters: () => void;
  isListFiltered: boolean;
}

const UserListCommodityRiskFilter: FC<UserListCommodityRiskFilterProps> = ({
  isFilterModalVisible,
  filterValues,
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

  const handleCheckboxChange = (key: keyof DefaultFilterValues, value: string) => {
    setState((prevState) => {
      const currentList = Array.isArray(prevState[key]) ? (prevState[key] as string[]) : [];
      const updatedList = currentList.includes(value)
        ? currentList.filter((item) => item !== value) // delete value if already set
        : [...currentList, value]; // adds value if not present

      return { ...prevState, [key]: updatedList };
    });
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
    selectedOverallThreats,
    selectedOverallValues,
    selectedMillPriority,
  } = state;

  const { countryList, stateList, subStateList } = filterCountryStateAndSubStateOptions(
    filterValues,
    selectedCountry,
    selectedState
  );

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
