import React, { Component } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import Select from 'react-select';
import ModalWrapper from '../modals/ModalWrapper';
import store from '../../store';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import { setFilterCount, toggleCanopyModal, updateFilters } from '../../actions/locationActions';
import Button from '../../../../common/js/components/Button';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { locationsPage } from '../../../../common/js/config';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import { checkValid, getLastValue } from '../../utils/locationsTableUtils';
import '../../../../common/css/filter-dialogs.scss';
import { getFilterCounter } from '../../utils/lists.utils';

/**
 * Check Selected Filter
 * @param {Object} location - Location object
 * @param {String} locationKey - Location object key
 * @param {String} selectedFilterValue -
 *  - Selected filter Value for ['selectedMillPriority', 'selectedOverallValues', 'selectedOverallThreats']
 *  - It can be ['low', 'medium', 'high']
 * @return {boolean|boolean} - Is location matching
 */
const checkSelectedFilter = (location, locationKey, selectedFilterValue) => {
  const value = location[locationKey];
  const lastValue = getLastValue(value);

  if (checkValid(value)) {
    const foundMatch =
      (selectedFilterValue === 'low' && lastValue === 0) ||
      (selectedFilterValue === 'medium' && lastValue === 1) ||
      (selectedFilterValue === 'high' && lastValue === 2);
    return foundMatch;
  } else {
    return false;
  }
};

export default class CommodityRiskFilter extends Component {
  constructor(props) {
    super(props);
    this.state = cloneDeep(locationsPage.defaultFilterValues);
    this.initialState = cloneDeep(locationsPage.defaultFilterValues);
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
      selectedParentCompany: '',
      selectedNames: [],
    });
  };

  changeState = (evt) => {
    this.setState({
      selectedState: evt.value,
      selectedSubState: '',
      selectedParentCompany: '',
      selectedNames: [],
    });
  };

  changeSubState = (evt) => {
    this.setState({
      selectedSubState: evt.value,
      selectedParentCompany: '',
      selectedNames: [],
    });
  };

  changeParentCompany = (evt) => {
    const listNames = this.props.listData
      .filter((location) => location['Parent Company'] === evt.value)
      .map((location) => {
        return { label: location['Location Name'], value: location['Location Name'] };
      });
    this.setState({
      selectedParentCompany: evt.value,
      selectedNames: listNames,
    });
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

  resetFilters = () => {
    this.setState(cloneDeep(this.initialState));
  };

  close = () => {
    if (this.props.filterCount === 0) {
      this.setState(this.initialState);
    }
    store.dispatch(toggleCanopyModal());
  };

  render() {
    const { listData } = this.props;
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

    const countryOptions = [
      ...new Set(
        listData.filter((location) => location.Country !== '').map((list) => list.Country)
      ),
    ].map(this.createOptions);
    const stateOptions = [
      ...new Set(
        listData
          .filter((location) => location.State !== '' && location.Country === selectedCountry)
          .map((list) => list.State)
      ),
    ].map(this.createOptions);
    const subStateOptions = [
      ...new Set(
        listData
          .filter(
            (location) =>
              location['Sub State'] !== '' &&
              location.Country === selectedCountry &&
              location.State === selectedState
          )
          .map((list) => list['Sub State'])
      ),
    ].map(this.createOptions);
    // 1. Filter based on if company/state/substate is selected
    // 2. Grab just parent company values
    // 3. Sort alphabetically
    const parentCompanyOptions = [
      ...new Set(
        listData
          .filter(
            (location) =>
              location['Parent Company'] &&
              (selectedCountry === '' || selectedCountry === location.Country) &&
              (selectedState === '' || selectedState === location.State) &&
              (selectedSubState === '' || selectedSubState === location['Sub State'])
          )
          .map((list) => list['Parent Company'])
      ),
    ]
      .sort()
      .map(this.createOptions);

    const dropdownOptionsMethodsCountry = buildDropdownOptions(
      countryOptions,
      'id',
      selectedCountry
    );
    const dropdownOptionsMethodsState = buildDropdownOptions(stateOptions, 'id', selectedState);
    const dropdownOptionsMethodsSubstate = buildDropdownOptions(
      subStateOptions,
      'id',
      selectedSubState
    );
    const dropdownOptionsMethodsParentCompany = buildDropdownOptions(
      parentCompanyOptions,
      'id',
      selectedParentCompany
    );

    const selectedNameLabels = selectedNames.map((v) => v.label.toLowerCase());
    const multiOptions = listData
      .filter((location) => {
        const initialFilter =
          location['Location Name'] !== '' &&
          location['Location Name'] !== ' ' &&
          !selectedNameLabels.includes(location['Location Name'].toLowerCase()) &&
          (selectedCountry === '' || selectedCountry === location.Country) &&
          (selectedState === '' || selectedState === location.State) &&
          (selectedSubState === '' || selectedSubState === location['Sub State']) &&
          (selectedParentCompany === '' || selectedParentCompany === location['Parent Company']);

        let certifiedRSPO = false;
        if ((location.Certification === 'RSPO' && showRSPOCertified) || !showRSPOCertified) {
          certifiedRSPO = true;
        }

        let selectedOverallThreatsFilter = true;
        if (selectedOverallThreats.length > 0) {
          selectedOverallThreatsFilter = checkSelectedFilter(
            location,
            'commodity_threat_overall_level',
            selectedOverallThreats
          );
        }

        let selectedOverallValuesFilter = true;
        if (selectedOverallValues.length > 0) {
          selectedOverallValuesFilter = checkSelectedFilter(
            location,
            'commodity_value_overall_level',
            selectedOverallValues
          );
        }

        let selectedMillPriorityFilter = true;
        if (selectedMillPriority.length > 0) {
          selectedMillPriorityFilter = checkSelectedFilter(
            location,
            'commodity_mill_priority_level',
            selectedMillPriority
          );
        }

        return (
          initialFilter &&
          certifiedRSPO &&
          selectedMillPriorityFilter &&
          selectedOverallThreatsFilter &&
          selectedOverallValuesFilter
        );
      })
      .map((list) => {
        return {
          id: list.location_id,
          label: list['Location Name'],
        };
      })
      .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
      .map((v) => {
        return { label: v.label, value: v.id };
      });

    return (
      <div>
        <ModalWrapper
          onClose={this.close}
          modalTitle={locationsPage.lists.filterModalTitle}
          theme="no-download"
          widthControl="commodity-risk-filter-container-gfw"
        >
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
              checked={showRSPOCertified}
              onChange={this.changeShowRSPOCertified}
              type="checkbox"
            />
            <label htmlFor="show-RSPO-certified">Show RSPO Certified</label>
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
          </div>

          <hr />

          <div className="filter-section-container flex-grid-column">
            <Select
              options={multiOptions}
              maxMenuHeight={150}
              onChange={this.changeNames}
              isMulti={true}
              isSearchable={true}
              placeholder={locationsPage.lists.protectedAreasPlaceholder}
              value={selectedNames}
            />
          </div>
          <div className="dialog__footer">
            <Button
              variant="primary"
              onClick={this.updateValues}
              label={locationsPage.lists.applyFilters}
            />
            <Button
              variant="secondary"
              onClick={this.resetFilters}
              label={locationsPage.lists.resetFilters}
            />
            <Button variant="secondary" onClick={this.close} label={locationsPage.lists.cancel} />
          </div>
        </ModalWrapper>
      </div>
    );
  }
}
