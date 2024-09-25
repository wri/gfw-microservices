import React, { Component } from 'react';
import { Select, Box, MenuItem, FormControl, InputLabel, Modal } from '@mui/material';
import cloneDeep from 'lodash/cloneDeep';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../../locations/js/actions/locationActions';
import Button from '../../../../../../common/js/components/Button';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { getFilterCounter } from '../../../../../../locations/js/utils/lists.utils';
import { defaultFilterValues } from '../../defaultFilterValues';
import { boxStyle, selectStyle } from './filterStyles';
import store from '../../../../../../locations/js/store';
import '../../../../../../common/css/filter-dialogs.scss';

export default class UserListCommodityRiskFilter extends Component {
  constructor(props) {
    super(props);
    this.state = cloneDeep(defaultFilterValues);
    this.initialState = cloneDeep(defaultFilterValues);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
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
    });
  };

  onStateChange = (evt) => {
    this.setState({ selectedState: evt.target.value, selectedSubState: '' });
  };

  onSubStateChange = (evt) => {
    this.setState({ selectedSubState: evt.target.value });
  };

  changeSupplier = (evt) => {
    this.setState({ selectedSupplier: evt.target.value });
  };

  changeSecondSupplier = (evt) => {
    this.setState({ selectedSecondSupplier: evt.target.value });
  };

  onParentCompanyChange = (evt) => {
    this.setState({ selectedParentCompany: evt.target.value });
  };

  changeOverallThreats = (evt) => {
    const myList = this.state.selectedOverallThreats;
    let elemIndex = myList.findIndex((item) => item === evt.value);
    if (elemIndex === -1) {
      myList.push(evt.value);
      this.setState({ selectedOverallThreats: myList });
    } else {
      myList.splice(elemIndex, 1);
      this.setState({ selectedOverallThreats: myList });
    }
  };

  changeOverallValues = (evt) => {
    const myList = this.state.selectedOverallValues;
    let elemIndex = myList.findIndex((item) => item === evt.value);
    if (elemIndex === -1) {
      myList.push(evt.target.value);
      this.setState({ selectedOverallValues: myList });
    } else {
      myList.splice(elemIndex, 1);
      this.setState({ selectedOverallValues: myList });
    }
  };

  changeMillPriority = (evt) => {
    const myList = this.state.selectedMillPriority;
    let elemIndex = myList.findIndex((item) => item === evt.value);
    if (elemIndex === -1) {
      myList.push(evt.target.value);
      this.setState({ selectedMillPriority: myList });
    } else {
      myList.splice(elemIndex, 1);
      this.setState({ selectedMillPriority: myList });
    }
  };

  changeShowRSPOCertified = () => {
    this.setState({ showRSPOCertified: !this.state.showRSPOCertified });
  };

  updateValues = () => {
    const counter = getFilterCounter(this.state);
    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(this.state));
    store.dispatch(setFilterCount(counter));

    gtag('event', 'list table filter', {
      event_category: 'Lists Click',
      event_label: 'user filtered the lists table',
    });
  };

  close = () => {
    if (this.props.filterCount === 0) {
      this.setState(this.initialState);
    }
    store.dispatch(toggleCanopyModal());
  };

  render() {
    const { listData } = this.props;

    const countries = [...new Set(listData.map((list) => list.Country))];

    const states = [
      ...new Set(
        listData
          .filter((location) => location.Country === this.state.selectedCountry)
          .map((list) => list.State)
      ),
    ];

    const subStates = [
      ...new Set(
        listData
          .filter(
            (location) =>
              location.Country === this.state.selectedCountry &&
              location.State === this.state.selectedState
          )
          .map((list) => list['Sub State'])
      ),
    ];

    const suppliersList = [
      ...new Set(
        listData.filter((list) => list['Supplier Name']).map((list) => list['Supplier Name'])
      ),
    ];

    const secondSuppliersList = [
      ...new Set(
        listData
          .filter((list) => list['Second Supplier Name'])
          .map((list) => list['Second Supplier Name'])
      ),
    ];

    const parentCompaniesList = [
      ...new Set(
        listData.filter((list) => list['Parent Company']).map((list) => list['Parent Company'])
      ),
    ];

    const {
      selectedCountry,
      selectedState,
      selectedSubState,
      selectedSupplier,
      selectedSecondSupplier,
      selectedParentCompany,
    } = this.state;
    return (
      <Modal open onClose={this.close}>
        <Box sx={boxStyle}>
          <h3>Filters</h3>

          <div className="flex-grid-column">
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
          </div>

          <hr />

          <div style={{ display: 'flex', gap: '15px', margin: '10px 0px' }}>
            <FormControl sx={selectStyle}>
              <InputLabel id="supplier-select">Supplier</InputLabel>
              <Select
                id="supplier-select"
                labelId="supplier-select"
                value={selectedSupplier}
                onChange={this.changeSupplier}
                label="Supplier"
              >
                {suppliersList.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div style={{ display: 'flex', gap: '15px', margin: '10px 0px' }}>
            <FormControl sx={selectStyle}>
              <InputLabel id="second-supplier-select">Second Supplier</InputLabel>
              <Select
                id="second-supplier-select"
                labelId="second-supplier-select"
                value={selectedSecondSupplier}
                onChange={this.changeSecondSupplier}
                label="Second Supplier"
              >
                {secondSuppliersList.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div style={{ display: 'flex', gap: '15px', margin: '10px 0px' }}>
            <div>
              <input
                id="show-RSPO-certified"
                checked={this.state.showRSPOCertified}
                onChange={this.changeShowRSPOCertified}
                type="checkbox"
              />
              <label htmlFor="show-RSPO-certified">Show RSPO Certified</label>
            </div>
            <FormControl sx={selectStyle}>
              <InputLabel id="parent-company-select">Parent Company</InputLabel>
              <Select
                id="parent-company-select"
                labelId="parent-company-select"
                value={selectedParentCompany}
                onChange={this.onParentCompanyChange}
                label="Parent Company"
              >
                {parentCompaniesList.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <hr />

          <div className="flex-grid-column">
            <div className="col flex-grid align-center space-between filter-spacer input-field__block-container">
              <span className="label">Overall Threats</span>
              <div className="flex-grid space-between">
                <div>
                  <input
                    type="checkbox"
                    id="overall-threats-high"
                    name="overall-threats-selection"
                    value="high"
                    checked={this.state.selectedOverallThreats.includes('high')}
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
                    checked={this.state.selectedOverallThreats.includes('medium')}
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
                    checked={this.state.selectedOverallThreats.includes('low')}
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
                    checked={this.state.selectedOverallValues.includes('high')}
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
                    checked={this.state.selectedOverallValues.includes('medium')}
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
                    checked={this.state.selectedOverallValues.includes('low')}
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
                    checked={this.state.selectedMillPriority.includes('high')}
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
                    checked={this.state.selectedMillPriority.includes('medium')}
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
                    checked={this.state.selectedMillPriority.includes('low')}
                    onChange={this.changeMillPriority}
                  />
                  <label htmlFor="mill-priority-low" className="filter-label">
                    {' '}
                    Low{' '}
                  </label>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Button variant="secondary" onClick={this.close} label="Cancel" />
              <Button variant="primary" onClick={this.updateValues} label="Apply" />
            </div>
          </div>
        </Box>
      </Modal>
    );
  }
}
