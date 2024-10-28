import React, { Component } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import ReactSelect from 'react-select';
import { Select, Box, MenuItem, FormControl, InputLabel, Modal, Grid } from '@mui/material';
import {
  setFilterCount,
  toggleCanopyModal,
  updateFilters,
} from '../../../../../../locations/js/actions/locationActions';
import Button from '../../../../../../common/js/components/Button';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { checkSelectedFilter } from '../../../../../../locations/js/utils/locationsTableUtils';
import { getFilterCounter } from '../../../../../../locations/js/utils/lists.utils';
import { defaultFilterValues } from '../../defaultFilterValues';
import filterCountryStateAndSubStateOptions from './filterCountryStateAndSubStateOptions';
import { boxStyle, selectStyle, multipleSelectStyles } from './filterStyles';
import store from '../../../../../../locations/js/store';
import '../../../../../../common/css/filter-dialogs.scss';

export default class GFWListCommodityRiskFilter extends Component {
  constructor(props) {
    super(props);
    this.state = cloneDeep(defaultFilterValues);
    this.initialState = cloneDeep(defaultFilterValues);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.filterCount !== 0 &&
      nextProps.filterCount === 0 &&
      nextProps.listView === 'commodity_risk'
    ) {
      this.setState(cloneDeep(this.initialState));
    } else if (
      this.props.filterCount === 0 &&
      nextProps.filterCount === 0 &&
      nextProps.listView === 'commodity_risk'
    ) {
      this.setState(cloneDeep(defaultFilterValues));
    }
  }

  createOptions = (value) => {
    return {
      id: value,
      label: value,
    };
  };

  onCountryChange = (evt) => {
    this.setState({
      selectedCountry: evt.target.value,
      selectedState: '',
      selectedSubState: '',
      selectedParentCompany: '',
      selectedNames: [],
    });
  };

  onStateChange = (evt) => {
    this.setState({
      selectedState: evt.target.value,
      selectedSubState: '',
      selectedParentCompany: '',
      selectedNames: [],
    });
  };

  onSubStateChange = (evt) => {
    this.setState({
      selectedSubState: evt.target.value,
      selectedParentCompany: '',
      selectedNames: [],
    });
  };

  onParentCompanyChange = (evt) => {
    const listNames = this.props.listData
      .filter((location) => location['Parent Company'] === evt.target.value)
      .map((location) => {
        return { label: location['Location Name'], value: location['Location Name'] };
      });
    this.setState({
      selectedParentCompany: evt.target.value,
      selectedNames: listNames,
    });
  };

  toggleCheckboxSelection = (key, value) => {
    this.setState((prevState) => {
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

  changeOverallThreats = (evt) => {
    this.toggleCheckboxSelection('selectedOverallThreats', evt.target.value);
  };

  changeOverallValues = (evt) => {
    this.toggleCheckboxSelection('selectedOverallValues', evt.target.value);
  };

  changeMillPriority = (evt) => {
    this.toggleCheckboxSelection('selectedMillPriority', evt.target.value);
  };

  onShowRSPOCertifiedChange = () => {
    this.setState({ showRSPOCertified: !this.state.showRSPOCertified });
  };

  changeNames = (values) => {
    this.setState({
      selectedNames: values,
    });
  };

  updateValues = () => {
    const counter = getFilterCounter(this.state);
    store.dispatch(toggleCanopyModal());
    const filters = { ...this.state };
    filters.selectedNames = filters.selectedNames.map((v) => v.label);
    store.dispatch(updateFilters(filters));
    store.dispatch(setFilterCount(counter));
  };

  close = () => {
    if (this.props.filterCount === 0) {
      this.setState(this.initialState);
    }
    store.dispatch(toggleCanopyModal());
  };

  render() {
    const { filterValues, locationNameOptionsForFilter, parentCompanyOptionsForFilter } =
      this.props;
    const {
      selectedCountry,
      selectedState,
      selectedSubState,
      selectedParentCompany,
      showRSPOCertified,
      selectedNames,
      selectedMillPriority,
      selectedOverallThreats,
      selectedOverallValues,
    } = this.state;

    const { countryList, stateList, subStateList } = filterCountryStateAndSubStateOptions(
      filterValues,
      selectedCountry,
      selectedState
    );

    const passesFilter = (location, filters) => {
      return filters.every(
        ({ key, values }) => values.length === 0 || checkSelectedFilter(location, key, values)
      );
    };

    const commodityFilters = [
      { key: 'commodity_threat_overall_level', values: selectedOverallThreats },
      { key: 'commodity_value_overall_level', values: selectedOverallValues },
      { key: 'commodity_mill_priority_level', values: selectedMillPriority },
    ];

    const matchesParentCompanyCriteria = (location) => {
      return (
        (selectedCountry === '' || selectedCountry === location.country) &&
        (selectedState === '' || selectedState === location.state) &&
        (selectedSubState === '' || selectedSubState === location.subState) &&
        (!showRSPOCertified || location.certification === 'RSPO')
      );
    };
    const filteredparentCompanyOptions = parentCompanyOptionsForFilter
      ?.filter(
        (location) =>
          passesFilter(location, commodityFilters) && matchesParentCompanyCriteria(location)
      )
      ?.slice(0, 400);

    const matchesLocationCriteria = (location) => {
      return (
        (selectedCountry === '' || selectedCountry === location.country) &&
        (selectedState === '' || selectedState === location.state) &&
        (selectedSubState === '' || selectedSubState === location.subState) &&
        (selectedParentCompany === '' || selectedParentCompany === location.parentCompany) &&
        (!showRSPOCertified || location.certification === 'RSPO')
      );
    };

    const filteredLocationNameOptions = locationNameOptionsForFilter
      ?.filter((location) => {
        return passesFilter(location, commodityFilters) && matchesLocationCriteria(location);
      })
      ?.slice(0, 400);

    return (
      <Modal open onClose={this.close}>
        <Box sx={boxStyle}>
          <h3>Filters</h3>
          <Grid container spacing={3}>
            <CountryStateSubStateFilter
              countries={countryList}
              selectedCountry={selectedCountry}
              onCountryChange={this.onCountryChange}
              states={stateList}
              selectedState={selectedState}
              onStateChange={this.onStateChange}
              subStates={subStateList}
              selectedSubState={selectedSubState}
              onSubStateChange={this.onSubStateChange}
            />

            <Grid item xs={4} sx={{ alignItems: 'center', display: 'flex' }}>
              <input
                id="show-RSPO-certified"
                checked={showRSPOCertified}
                onChange={this.onShowRSPOCertifiedChange}
                type="checkbox"
              />
              <label htmlFor="show-RSPO-certified">Show RSPO Certified</label>
            </Grid>
            <Grid item xs={8}>
              <FormControl sx={selectStyle}>
                <InputLabel id="parent-company-select">Parent company</InputLabel>
                <Select
                  id="parent-company-select"
                  labelId="parent-company-select"
                  value={selectedParentCompany}
                  onChange={this.onParentCompanyChange}
                  label="Parent company"
                >
                  {filteredparentCompanyOptions.map(({ label, value }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

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
            </Grid>

            <Grid item xs={12}>
              <ReactSelect
                options={filteredLocationNameOptions}
                onChange={this.changeNames}
                isMulti
                isSearchable
                placeholder="LOCATIONS"
                value={selectedNames}
                styles={multipleSelectStyles}
              />
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
              <Button variant="secondary" onClick={this.close} label="Cancel" />

              <Button
                style={{ marginLeft: '10px' }}
                variant="primary"
                onClick={this.updateValues}
                label="Apply"
              />
            </Grid>
          </Grid>
        </Box>
      </Modal>
    );
  }
}
