import React, { Component } from 'react';
import Select from 'react-select';
import ModalWrapper from '../modals/ModalWrapper';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import store from '../../store';
import { toggleCanopyModal, updateFilters, setFilterCount } from '../../actions/locationActions';
import Button from '../../../../common/js/components/Button';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { locationsPage } from '../../../../common/js/config';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import '../../../../common/css/filter-dialogs.scss';

/**
 * Function that is used to filter all locations within a list.
 * @param {Object} location The location that we are filtering
 * @param {string} filterStr The string to filter based on user input
 * @param {string} selectedCountry The country
 * @param {string} selectedState The state
 * @param {string} selectedSubState The substate
 * @param {string} selectedParentCompany The parent company
 * @param {boolean} showRSPOCertified Boolean to determine if the user wants to filter for RSPO
 * @returns {boolean} true if we want to show the location in the menu, false if we want to hide it
 */
const multiOptionsFilterLogic = (
  location,
  filterStr,
  selectedCountry,
  selectedState,
  selectedSubState,
  selectedParentCompany,
  showRSPOCertified
) => {
  const locationName = location['Location Name'];
  const investmentName = location['Investment Name'];

  const initialFilter =
    (locationName !== '' || investmentName !== '') &&
    (locationName !== ' ' || investmentName !== ' ') &&
    (selectedCountry === '' || selectedCountry === location.Country) &&
    (selectedState === '' || selectedState === location.State) &&
    (selectedSubState === '' || selectedSubState === location['Sub State']) &&
    (selectedParentCompany === '' || selectedParentCompany === location['Parent Company']);

  let stringSearchFilter = true;
  if (filterStr.length > 0) {
    stringSearchFilter =
      (locationName && locationName.toLowerCase().includes(filterStr.toLowerCase())) ||
      (investmentName && investmentName.toLowerCase().includes(filterStr.toLowerCase()));
  }

  let certifiedRSPO = false;
  if ((location.Certification === 'RSPO' && showRSPOCertified) || !showRSPOCertified) {
    certifiedRSPO = true;
  }
  return initialFilter && stringSearchFilter && certifiedRSPO;
};

export default class GFWForestChangeFilter extends Component {
  constructor(props) {
    super(props);
    this.state = { ...locationsPage.defaultFilterValues };
    this.initialState = this.state;
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.filterCount !== 0 &&
      nextProps.filterCount === 0 &&
      nextProps.listView === 'forest_change'
    ) {
      this.setState(this.initialState);
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
        return {
          value: location.location_id,
          label: location['Location Name'] || location['Investment Name'],
        };
      });
    this.setState({
      selectedParentCompany: evt.value,
      selectedNames: listNames,
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

  close = () => {
    if (this.props.filterCount === 0) {
      this.setState(this.initialState);
    }
    store.dispatch(toggleCanopyModal());
  };

  render() {
    const { listData, list_name } = this.props;
    const {
      selectedCountry,
      selectedState,
      selectedSubState,
      selectedParentCompany,
      filterStr,
      showRSPOCertified,
      selectedNames,
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

    const multiOptions = listData
      .filter((location) =>
        multiOptionsFilterLogic(
          location,
          filterStr,
          selectedCountry,
          selectedState,
          selectedSubState,
          selectedParentCompany,
          showRSPOCertified
        )
      )
      .map((list) => {
        return {
          value: list.location_id,
          label: list['Location Name'] || list['Investment Name'],
        };
      })
      .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));

    return (
      <div>
        <ModalWrapper
          onClose={this.close}
          modalTitle={locationsPage.lists.filterModalTitle}
          theme="no-download"
          widthControl="forest-change-filter-container-gfw"
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

          {list_name === 'Palm Oil Mills' ? (
            <div className="col dropdown-group input-field__block-container">
              <input
                id="show-RSPO-certified"
                className="dropdown-group__dropdown"
                checked={showRSPOCertified}
                onChange={this.changeShowRSPOCertified}
                type="checkbox"
              />
              <label htmlFor="show-RSPO-certified">Show RSPO Certified</label>
            </div>
          ) : null}

          {list_name === 'Palm Oil Mills' ? (
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
          ) : null}

          <div className="col">
            <div className="filter-section-container flex-grid-column">
              <div className="col">
                <Select
                  isMulti={true}
                  isSearchable={true}
                  maxMenuHeight={150}
                  className="edge-multi-select"
                  onChange={(evt) => this.changeNames(evt)}
                  options={multiOptions}
                  value={selectedNames}
                />
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
        </ModalWrapper>
      </div>
    );
  }
}
