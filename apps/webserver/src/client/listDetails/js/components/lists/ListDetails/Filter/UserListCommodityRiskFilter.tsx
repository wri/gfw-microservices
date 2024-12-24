import React, { useState } from 'react';
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
import Button from '../../../../../../common/js/components/Button';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { getFilterCounter } from '../../../../../../locations/js/utils/lists.utils';
import { DefaultFilterValues } from '../../DefaultFilterValuesType';
import filterCountryStateAndSubStateOptions from './filterCountryStateAndSubStateOptions';
import { boxStyle, selectStyle } from './filterStyles';
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

const UserListCommodityRiskFilter: React.FC<UserListCommodityRiskFilterProps> = ({
  isFilterModalVisible,
  filterValues,
  parentCompanyOptionsForFilter,
  supplierNameOptionsForFilter,
  secondSupplierNameOptionsForFilter,
  clearFilters,
  isListFiltered,
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

  /* commented while we fix filtering by these attributes
  https://gfw.atlassian.net/browse/GPV-3773

  const changeOverallThreats = (evt: React.ChangeEvent<{ value: unknown }>) => {
    setState((prevState) => {
      const myList = [...prevState.selectedOverallThreats];
      const value = evt.target.value as string;
      const elemIndex = myList.findIndex((item) => item === value);
      if (elemIndex === -1) {
        myList.push(value);
      } else {
        myList.splice(elemIndex, 1);
      }
      return { ...prevState, selectedOverallThreats: myList };
    });
  };

  const changeOverallValues = (evt: React.ChangeEvent<{ value: unknown }>) => {
    setState((prevState) => {
      const myList = [...prevState.selectedOverallValues];
      const value = evt.target.value as string;
      const elemIndex = myList.findIndex((item) => item === value);
      if (elemIndex === -1) {
        myList.push(value);
      } else {
        myList.splice(elemIndex, 1);
      }
      return { ...prevState, selectedOverallValues: myList };
    });
  };

  const changeMillPriority = (evt: React.ChangeEvent<{ value: unknown }>) => {
    setState((prevState) => {
      const myList = [...prevState.selectedMillPriority];
      const value = evt.target.value as string;
      const elemIndex = myList.findIndex((item) => item === value);
      if (elemIndex === -1) {
        myList.push(value);
      } else {
        myList.splice(elemIndex, 1);
      }
      return { ...prevState, selectedMillPriority: myList };
    });
  };
  */

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

          {/* commented while we fix the filtering by these attributes
  https://gfw.atlassian.net/browse/GPV-3773
       <Grid item xs={12} sx={{ alignItems: 'center' }}>
          <div className="col flex-grid align-center space-between filter-spacer input-field__block-container">
            <span className="label">Overall Threats</span>
            <div className="flex-grid space-between">
              <div>
                <input
                  type="checkbox"
                  id="overall-threats-high"
                  name="overall-threats-selection"
                  value="high"
                  checked={selectedOverallThreats?.includes('high')}
                  onChange={changeOverallThreats}
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
                  checked={selectedOverallThreats?.includes('medium')}
                  onChange={changeOverallThreats}
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
                  checked={selectedOverallThreats?.includes('low')}
                  onChange={changeOverallThreats}
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
                  checked={selectedOverallValues?.includes('high')}
                  onChange={changeOverallValues}
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
                  checked={selectedOverallValues?.includes('medium')}
                  onChange={changeOverallValues}
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
                  checked={selectedOverallValues?.includes('low')}
                  onChange={changeOverallValues}
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
                  checked={selectedMillPriority?.includes('high')}
                  onChange={changeMillPriority}
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
                  checked={selectedMillPriority?.includes('medium')}
                  onChange={changeMillPriority}
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
                  checked={selectedMillPriority?.includes('low')}
                  onChange={changeMillPriority}
                />
                <label htmlFor="mill-priority-low" className="filter-label">
                  {' '}
                  Low{' '}
                </label>
              </div>
            </div>{' '}
          </div>
        </Grid>*/}

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
            {isListFiltered && (
              <Button
                style={{ marginLeft: '10px' }}
                variant="secondary"
                onClick={clearFilters}
                label="Clear"
              />
            )}
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

export default UserListCommodityRiskFilter;
