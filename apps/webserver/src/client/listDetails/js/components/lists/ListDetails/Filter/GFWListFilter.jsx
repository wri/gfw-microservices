import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { Select, MenuItem, FormControl, InputLabel, Box, Modal, Grid } from '@mui/material';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import Button from '../../../../../../common/js/components/Button';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { defaultFilterValues } from '../../defaultFilterValues';
import { boxStyle, multipleSelectStyles, selectStyle } from './filterStyles';
import store from '../../../../../../locations/js/store';
import '../../../../../../common/css/filter-dialogs.scss';

export default class GFWListFilter extends Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultFilterValues };
    this.initialState = this.state;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.filterCount !== 0 && nextProps.filterCount === 0) {
      this.setState(this.initialState);
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

  changeParentCompany = (evt) => {
    this.setState({
      selectedParentCompany: evt.target.value,
    });
  };

  changeShowRSPOCertified = () => {
    this.setState({ showRSPOCertified: !this.state.showRSPOCertified });
  };

  changeNames = (results) => {
    this.setState({
      selectedNames: results,
    });
  };

  searchNames = (evt) => {
    this.setState({ filterStr: evt.target.value });
  };

  updateValues = () => {
    let filterCount = 0;
    Object.keys(this.state).forEach((key) => {
      if (key === 'selectedCountry' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedState' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedSubState' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedNames' && this.state[key].length > 0) {
        filterCount++;
      } else if (key === 'showRSPOCertified' && this.state[key]) {
        filterCount++;
      } else if (key === 'selectedParentCompany' && this.state[key] !== '') {
        filterCount++;
      }
    });
    const obj = Object.assign({}, this.state);
    obj.selectedNames = this.state.selectedNames.map((n) => n.label);
    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(obj));
    store.dispatch(setFilterCount(filterCount));
  };

  resetFilters = () => {
    this.props.clearFilters();
    store.dispatch(toggleCanopyModal());
  };

  close = () => {
    if (this.props.filterCount === 0) {
      this.setState(this.initialState);
    }
    store.dispatch(toggleCanopyModal());
  };

  render() {
    const { list_name, filterValues, locationNameOptionsForFilter, parentCompanyOptionsForFilter } =
      this.props;
    const {
      selectedCountry,
      selectedState,
      selectedSubState,
      selectedParentCompany,
      showRSPOCertified,
      selectedNames,
    } = this.state;

    const countryList = Object.keys(filterValues).filter((name) => name !== 'null');

    const stateList =
      selectedCountry && selectedCountry in filterValues
        ? Object.keys(filterValues[selectedCountry])
        : [];

    const subStateList = selectedState ? filterValues[selectedCountry][selectedState] : [];

    // 1. Filter based on if company/state/substate is selected
    // 2. Grab just parent company values
    // 3. Sort alphabetically

    const filteredLocationNameOptions = locationNameOptionsForFilter?.filter(
      (location) =>
        (selectedCountry === '' || selectedCountry === location.country) &&
        (selectedState === '' || selectedState === location.state) &&
        (selectedSubState === '' || selectedSubState === location.subState) &&
        (selectedParentCompany === '' || selectedParentCompany === location.parentCompany) &&
        (!showRSPOCertified || location.certification === 'RSPO')
    );

    let filteredparentCompanyOptions = [];
    if (list_name === 'Palm Oil Mills') {
      filteredparentCompanyOptions = parentCompanyOptionsForFilter
        ?.filter(
          (location) =>
            (selectedCountry === '' || selectedCountry === location.country) &&
            (selectedState === '' || selectedState === location.state) &&
            (selectedSubState === '' || selectedSubState === location.subState) &&
            (!showRSPOCertified || location.certification === 'RSPO')
        )
        ?.slice(0, 400);
    }

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

            {list_name === 'Palm Oil Mills' && (
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
                    className="dropdown-group__dropdown"
                    checked={showRSPOCertified}
                    onChange={this.changeShowRSPOCertified}
                    type="checkbox"
                  />
                  <label htmlFor="show-RSPO-certified">Show RSPO Certified</label>
                </div>

                <FormControl sx={selectStyle}>
                  <InputLabel id="parent-company-select-label">PARENT COMPANY</InputLabel>
                  <Select
                    labelId="parent-company-select-label"
                    id="country_select"
                    value={selectedParentCompany ?? ''}
                    onChange={this.changeParentCompany}
                    label="PARENT COMPANY"
                  >
                    {filteredparentCompanyOptions.map(({ label, value }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <ReactSelect
                isMulti={true}
                isSearchable={true}
                maxMenuHeight={150}
                className="edge-multi-select"
                onChange={(evt) => this.changeNames(evt)}
                options={filteredLocationNameOptions}
                value={selectedNames}
                styles={multipleSelectStyles}
                placeholder="LOCATIONS"
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
