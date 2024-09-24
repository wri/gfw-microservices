import React, { Component } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box, Modal } from '@mui/material';
import ReactSelect from 'react-select';
import Button from '../../../../../../common/js/components/Button';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
  removeList,
} from '../../../../../../locations/js/actions/locationActions';
import { defaultFilterValues } from '../../defaultFilterValues';
import store from '../../../../../../locations/js/store';
import { boxStyle, selectStyle, multipleSelectStyles } from './filterStyles';
import '../../../../../../common/css/filter-dialogs.scss';

export default class AdministrativeAreasGFWListFilter extends Component {
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
      selectedStates: [],
      selectedSubStates: [],
    });
  };

  onStateChange = (values) => {
    this.setState({
      selectedStates: values.map((s) => s.value),
      selectedSubStates: [],
    });
  };

  onSubStateChange = (values) => {
    this.setState({ selectedSubStates: values.map((s) => s.value) });
  };

  updateValues = () => {
    let filterCount = 0;
    Object.keys(this.state).forEach((key) => {
      if (key === 'selectedCountry' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedStates' && this.state[key].length !== 0) {
        filterCount++;
      } else if (key === 'selectedSubStates' && this.state[key].length !== 0) {
        filterCount++;
      }
    });
    const filters = {
      selectedCountry: this.state.selectedCountry,
      selectedStates: this.state.selectedStates,
      selectedSubStates: this.state.selectedSubStates,
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
      store.dispatch(removeList(0));
      this.props.history.push('/');
    }
  };

  render() {
    const { adminAreas } = this.props;
    const { selectedCountry, selectedStates, selectedSubStates } = this.state;

    const countries = [
      ...new Set(
        adminAreas.filter((location) => location.Country !== '').map((list) => list.Country)
      ),
    ];

    const statesOptions = [
      ...new Set(
        adminAreas
          .filter((location) => location.Country === selectedCountry && location.State !== '')
          .map((list) => list.State)
      ),
    ].map((v) => {
      return { label: v, value: v };
    });

    const subStatesOptions = adminAreas
      .filter(
        (area) =>
          area.Country === selectedCountry &&
          !!area['Sub State'] &&
          selectedStates.includes(area.State)
      )
      .map((area) => area['Sub State'])
      .map((v) => {
        return { label: v, value: v };
      });

    return (
      <Modal open onClose={this.close}>
        <Box sx={boxStyle}>
          <h3>Show Adminstrative Areas for</h3>

          <FormControl sx={selectStyle}>
            <InputLabel id="country-select-label">Country</InputLabel>
            <Select
              labelId="country-select-label"
              id="country_select"
              value={selectedCountry}
              onChange={this.onCountryChange}
              label="Country"
            >
              {countries.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div style={{ margin: '10px 0px' }}>
            <ReactSelect
              options={statesOptions}
              onChange={this.onStateChange}
              isMulti
              isSearchable
              placeholder="STATES"
              value={selectedStates.map((v) => ({ value: v, label: v }))}
              styles={multipleSelectStyles}
            />
          </div>
          <div style={{ margin: '10px 0px' }}>
            <ReactSelect
              options={subStatesOptions}
              onChange={this.onSubStateChange}
              isMulti
              isSearchable
              placeholder="SUB STATES"
              value={selectedSubStates.map((v) => ({ value: v, label: v }))}
              styles={multipleSelectStyles}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              margin: '10px 0px',
            }}
          >
            <Button variant="secondary" onClick={this.close} label="Cancel" />
            <Button
              style={{ marginLeft: '10px' }}
              variant="primary"
              disabled={
                selectedCountry !== '' || selectedStates.length > 0 || selectedSubStates.length > 0
                  ? false
                  : true
              }
              onClick={() => {
                selectedCountry !== '' || selectedStates.length > 0 || selectedSubStates.length > 0
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
