import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { Select, Box, MenuItem, FormControl, InputLabel, Modal } from '@mui/material';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import Button from '../../../../../../common/js/components/Button';
import CountryStateSubStateFilter from '../../ListDetails/CountryStateSubStateFilter';
import { defaultFilterValues } from '../../defaultFilterValues';
import store from '../../../../../../locations/js/store';
import { boxStyle, selectStyle, multipleSelectStyles } from './filterStyles';
import '../../../../../../common/css/filter-dialogs.scss';

export default class GFWProtectedForestChangeFilter extends Component {
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

  onCountryChange = (evt) => {
    this.setState({
      selectedCountry: evt.target.value,
      selectedState: '',
      selectedSubState: '',
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  onStateChange = (evt) => {
    this.setState({
      selectedState: evt.target.value,
      selectedSubState: '',
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  onSubStateChange = (evt) => {
    this.setState({
      selectedSubState: evt.target.value,
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  onDesignationTypeChange = (evt) => {
    this.setState({
      selectedDesignationType: evt.target.value,
    });
  };

  onDesignationChange = (evt) => {
    this.setState({
      selectedDesignation: evt.target.value,
    });
  };

  onProtectedAreasChange = (values) => {
    this.setState({ selectedNames: values });
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
      } else if (key === 'selectedDesignationType' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedDesignation' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedNames' && this.state[key].length > 0) {
        filterCount++;
      }
    });
    const filters = {
      selectedCountry: this.state.selectedCountry,
      selectedState: this.state.selectedState,
      selectedSubState: this.state.selectedSubState,
      selectedDesignationType: this.state.selectedDesignationType,
      selectedDesignation: this.state.selectedDesignation,
      selectedNames: this.state.selectedNames.map((v) => v.label),
    };
    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(filters));
    store.dispatch(setFilterCount(filterCount));
  };

  close = () => {
    if (this.props.filterCount === 0) {
      this.setState(this.initialState);
    }
    store.dispatch(toggleCanopyModal());
    // If the user hasn't selected anything, also direct them back to the Locations landing page.
    if (!this.state.selectedCountry) {
      window.location.href = '/locations';
    }
  };

  render() {
    const { protectedAreas } = this.props;
    const {
      selectedCountry,
      selectedState,
      selectedSubState,
      selectedDesignationType,
      selectedDesignation,
      selectedNames,
    } = this.state;

    const countries = [
      ...new Set(
        protectedAreas.filter((location) => location.Country !== '').map((list) => list.Country)
      ),
    ];

    const states = [
      ...new Set(
        protectedAreas
          .filter((location) => location.Country === selectedCountry && location.State !== '')
          .map((list) => list.State)
      ),
    ];

    const subStates = [
      ...new Set(
        protectedAreas
          .filter(
            (location) =>
              location.Country === selectedCountry &&
              location.State === selectedState &&
              location['Sub State'] !== '' &&
              location['Sub State']
          )
          .map((list) => list['Sub State'])
      ),
    ];
    const designationTypeOptions = [
      ...new Set(
        protectedAreas
          .filter(
            (location) =>
              location.Country === selectedCountry &&
              location.State === selectedState &&
              (selectedSubState === '' || location['Sub State'] === selectedSubState) &&
              location['Designation Type']
          )
          .map((list) => list['Designation Type'])
      ),
    ];

    const designationOptions = [
      ...new Set(
        protectedAreas
          .filter(
            (location) =>
              location.Country === selectedCountry &&
              location.State === selectedState &&
              (selectedSubState === '' || location['Sub State'] === selectedSubState) &&
              location.Designation
          )
          .map((list) => list.Designation)
      ),
    ];

    const protectedAreasOptions = [
      ...new Set(
        protectedAreas
          .filter(
            (location) =>
              location['Location Name'] &&
              location['Location Name'] !== '' &&
              location.Country === selectedCountry &&
              (selectedState === null ||
                selectedState === '' ||
                location.State === selectedState) &&
              (selectedSubState === null ||
                selectedSubState === '' ||
                location['Sub State'] === selectedSubState) &&
              (selectedDesignationType === null ||
                selectedDesignationType === '' ||
                location.DesignationType === selectedDesignationType) &&
              (selectedDesignation === null ||
                selectedDesignation === '' ||
                location.Designation === selectedDesignation)
          )
          .map((list) => list['Location Name'])
      ),
    ].map((v) => {
      return { label: v, value: v };
    });

    return (
      <Modal open onClose={this.close}>
        <Box sx={boxStyle}>
          <h3>Show Protected Areas for</h3>
          <CountryStateSubStateFilter
            countries={countries}
            selectedCountry={selectedCountry}
            onCountryChange={this.onCountryChange}
            states={states}
            selectedState={selectedState}
            onStateChange={this.onStateChange}
            subStates={subStates}
            selectedSubState={selectedSubState}
            onSubStateChange={this.onSubStateChange}
          />
          <div style={{ display: 'flex', gap: '15px', margin: '10px 0px' }}>
            <FormControl sx={selectStyle}>
              <InputLabel id="designation-type">Designation Type</InputLabel>
              <Select
                id="designation-type"
                labelId="designation-type"
                value={selectedDesignationType}
                onChange={this.onDesignationTypeChange}
                label="Designation Type"
              >
                {designationTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={selectStyle}>
              <InputLabel id="designation">Designation</InputLabel>

              <Select
                id="designation"
                labelId="designation"
                value={selectedDesignation}
                onChange={this.onDesignationChange}
                label="Designation"
              >
                {designationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div style={{ margin: '10px 0px' }}>
            <ReactSelect
              options={protectedAreasOptions}
              onChange={this.onProtectedAreasChange}
              isMulti
              isSearchable
              placeholder="PROTECTED AREAS"
              value={selectedNames}
              styles={multipleSelectStyles}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Button variant="secondary" onClick={this.close} label="Clear" />
            <Button
              style={{ marginLeft: '10px' }}
              variant="primary"
              disabled={
                selectedCountry !== '' || selectedState !== '' || selectedSubState !== ''
                  ? false
                  : true
              }
              onClick={() => {
                selectedCountry !== '' || selectedState !== '' || selectedSubState !== ''
                  ? this.updateValues()
                  : null;
              }}
              label="Apply"
            />
          </div>
        </Box>
      </Modal>
    );
  }
}
