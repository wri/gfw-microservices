import React, { Component } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import ModalWrapper from '../modals/ModalWrapper';
import store from '../../store';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import { toggleCanopyModal, updateFilters, setFilterCount } from '../../actions/locationActions';
import { locationsPage } from '../../../../common/js/config';
import Button from '../../../../common/js/components/Button';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { getFilterCounter } from '../../utils/lists.utils';
import '../../../../common/css/filter-dialogs.scss';

export default class CommodityRiskFilter extends Component {
  constructor(props) {
    super(props);
    this.state = cloneDeep(locationsPage.defaultFilterValues);
    this.initialState = cloneDeep(locationsPage.defaultFilterValues);
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
      this.setState(cloneDeep(locationsPage.defaultFilterValues));
    }
  }

  createOptions = (value) => {
    return {
      id: value,
      label: value,
    };
  };

  changeCountry = (evt) => {
    this.setState({
      selectedCountry: evt.value,
      selectedState: '',
      selectedSubState: '',
    });
  };

  changeState = (evt) => {
    this.setState({ selectedState: evt.value, selectedSubState: '' });
  };

  changeSubState = (evt) => {
    this.setState({ selectedSubState: evt.value });
  };

  changeSupplier = (evt) => {
    this.setState({ selectedSupplier: evt.value });
  };

  changeSecondSupplier = (evt) => {
    this.setState({ selectedSecondSupplier: evt.value });
  };

  changeParentCompany = (evt) => {
    this.setState({ selectedParentCompany: evt.value });
  };

  changeOverallThreats = (evt) => {
    const myList = this.state.selectedOverallThreats;
    let elemIndex = myList.findIndex((item) => item === evt.target.value);
    if (elemIndex === -1) {
      myList.push(evt.target.value);
      this.setState({ selectedOverallThreats: myList });
    } else {
      myList.splice(elemIndex, 1);
      this.setState({ selectedOverallThreats: myList });
    }
  };

  changeOverallValues = (evt) => {
    const myList = this.state.selectedOverallValues;
    let elemIndex = myList.findIndex((item) => item === evt.target.value);
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
    let elemIndex = myList.findIndex((item) => item === evt.target.value);
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
      ''event_category'': 'Lists Click',
      ''event_label'': 'user filtered the lists table',
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

    const countryOptions = [...new Set(listData.map((list) => list.Country))].map(
      this.createOptions
    );
    const stateOptions = [
      ...new Set(
        listData
          .filter((location) => location.Country === this.state.selectedCountry)
          .map((list) => list.State)
      ),
    ].map(this.createOptions);
    const subStateOptions = [
      ...new Set(
        listData
          .filter(
            (location) =>
              location.Country === this.state.selectedCountry &&
              location.State === this.state.selectedState
          )
          .map((list) => list['Sub State'])
      ),
    ].map(this.createOptions);
    const supplierOptions = [
      ...new Set(
        listData.filter((list) => list['Supplier Name']).map((list) => list['Supplier Name'])
      ),
    ].map(this.createOptions);
    const secondSupplierOptions = [
      ...new Set(
        listData
          .filter((list) => list['Second Supplier Name'])
          .map((list) => list['Second Supplier Name'])
      ),
    ].map(this.createOptions);
    const parentCompanyOptions = [
      ...new Set(
        listData.filter((list) => list['Parent Company']).map((list) => list['Parent Company'])
      ),
    ].map(this.createOptions);

    const dropdownOptionsMethodsCountry = buildDropdownOptions(
      countryOptions,
      'id',
      this.state.selectedCountry
    );
    const dropdownOptionsMethodsState = buildDropdownOptions(
      stateOptions,
      'id',
      this.state.selectedState
    );
    const dropdownOptionsMethodsSubstate = buildDropdownOptions(
      subStateOptions,
      'id',
      this.state.selectedSubState
    );
    const dropdownOptionsMethodsSupplier = buildDropdownOptions(
      supplierOptions,
      'id',
      this.state.selectedSupplier
    );
    const dropdownOptionsMethodsSecondSupplier = buildDropdownOptions(
      secondSupplierOptions,
      'id',
      this.state.selectedSecondSupplier
    );
    const dropdownOptionsMethodsParentCompany = buildDropdownOptions(
      parentCompanyOptions,
      'id',
      this.state.selectedParentCompany
    );

    const {
      selectedCountry,
      selectedParentCompany,
      selectedSecondSupplier,
      selectedState,
      selectedSubState,
      selectedSupplier,
    } = this.state;
    return (
      <div>
        <ModalWrapper
          onClose={this.close}
          modalTitle={locationsPage.lists.filterModalTitle}
          theme="no-download"
          widthControl="commodity-risk-filter-container"
        >
          <div className="flex-grid-column">
            <CountryStateSubStateFilter
              countries={dropdownOptionsMethodsCountry}
              selectedCountry={selectedCountry}
              onCountryChange={this.changeCountry}
              states={dropdownOptionsMethodsState}
              selectedState={selectedState}
              onStateChange={this.changeState}
              subStates={dropdownOptionsMethodsSubstate}
              selectedSubState={selectedSubState}
              onSubStateChange={this.changeSubState}
            />
          </div>

          <hr />

          <div className="flex-grid-column">
            <div className="col dropdown-group input-field__block-container">
              <label htmlFor="select_supplier" className="block-label">
                {locationsPage.lists.supplierLabel}
              </label>
              <GfwSelect
                id="select_supplier"
                className="dropdown-group__dropdown"
                options={dropdownOptionsMethodsSupplier.dropdownOptions}
                value={dropdownOptionsMethodsSupplier.value}
                onChange={this.changeSupplier}
                placeholder={locationsPage.lists.selectPlaceholder}
              />
            </div>
            <div className="col dropdown-group input-field__block-container">
              <label htmlFor="select_second_supplier" className="block-label">
                {locationsPage.lists.secondSupplierLabel}
              </label>
              <GfwSelect
                id="select_second_supplier"
                className="dropdown-group__dropdown"
                options={dropdownOptionsMethodsSecondSupplier.dropdownOptions}
                value={dropdownOptionsMethodsSecondSupplier.value}
                onChange={this.changeSecondSupplier}
                placeholder={locationsPage.lists.selectPlaceholder}
              />
            </div>
            <div className="col dropdown-group input-field__block-container">
              <label htmlFor="select_parent_company" className="block-label">
                {locationsPage.lists.parentCompanyLabel}
              </label>
              <GfwSelect
                id="select_parent_company"
                className="dropdown-group__dropdown"
                options={dropdownOptionsMethodsParentCompany.dropdownOptions}
                value={dropdownOptionsMethodsParentCompany.value}
                onChange={this.changeParentCompany}
                placeholder={locationsPage.lists.selectPlaceholder}
              />
            </div>
            <div className="col filter-section-container input-field__block-container">
              <input
                id="show-RSPO-certified"
                checked={this.state.showRSPOCertified}
                onChange={this.changeShowRSPOCertified}
                type="checkbox"
              />
              <label htmlFor="show-RSPO-certified">Show RSPO Certified</label>
            </div>
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

            <div className="dialog__footer">
              <Button
                variant="primary"
                onClick={this.updateValues}
                label={locationsPage.lists.applyFilters}
              />
            </div>
          </div>
        </ModalWrapper>
      </div>
    );
  }
}
