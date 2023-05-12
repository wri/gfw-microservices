import React, { Component } from 'react';
import ModalWrapper from '../../../../map/js/components/modals/ModalWrapper';
import store from '../../store';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { locationsPage } from '../../../../common/js/config';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import { toggleCanopyModal, updateFilters, setFilterCount } from '../../actions/locationActions';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import AreaFilterSlider from './AreaFilterSlider';

export default class PolicyFilter extends Component {
  constructor(props) {
    super(props);
    this.state = { ...locationsPage.defaultFilterValues };
    this.initialState = this.state;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.filterCount !== 0 && nextProps.filterCount === 0 && nextProps.listView === 'policy') {
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
    this.setState({ selectedCountry: evt.value });
  };

  changeState = (evt) => {
    this.setState({ selectedState: evt.value });
  };

  changeSubState = (evt) => {
    this.setState({ selectedSubState: evt.value });
  };

  changeCommodity = (evt) => {
    this.setState({ selectedCommodity: evt.value });
  };

  changeCompany = (evt) => {
    this.setState({ selectedCompany: evt.value });
  };

  changeAreaRange = (_evt, newValue) => {
    this.setState({
      selectedAreaMin: newValue[0],
      selectedAreaMax: newValue[1],
    });
  };

  changeShowFlagged = () => {
    this.setState({ showFlagged: !this.state.showFlagged });
  };

  changeShowCertified = () => {
    this.setState({ showCertified: !this.state.showCertified });
  };

  changeShowGreen = () => {
    this.setState({
      showGreen: !this.state.showGreen,
      showOrange: false,
    });
  };

  changeShowOrange = () => {
    this.setState({
      showOrange: !this.state.showOrange,
      showGreen: false,
    });
  };

  updateValues = () => {
    let filterCount = 0;
    Object.keys(this.state).forEach((key) => {
      if (key === 'selectedCountry' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedCommodity' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedState' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedSubState' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedCompany' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedAreaMin' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'selectedAreaMax' && this.state[key] !== '') {
        filterCount++;
      } else if (key === 'showFlagged' && this.state[key]) {
        filterCount++;
      } else if (key === 'showCertified' && this.state[key]) {
        filterCount++;
      } else if (key === 'showGreen' && this.state[key]) {
        filterCount++;
      } else if (key === 'showOrange' && this.state[key]) {
        filterCount++;
      }
    });
    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(this.state));
    store.dispatch(setFilterCount(filterCount));

    ga('send', 'event', 'Lists Click', 'list table filter', 'user filtered the lists table');
  };

  close = () => {
    store.dispatch(toggleCanopyModal());
  };

  clearCountryDropdown = () => {
    this.setState({
      selectedCountry: '',
      selectedState: '',
      selectedSubState: '',
    });
  };

  clearStateDropdown = () => {
    this.setState({
      selectedState: '',
    });
  };

  clearSubStateDropdown = () => {
    this.setState({
      selectedSubState: '',
    });
  };

  clearCommodityDropdown = () => {
    this.setState({
      selectedCommodity: '',
    });
  };

  clearCompanyDropdown = () => {
    this.setState({
      selectedCompany: '',
    });
  };

  render() {
    const { listData, maximumAnalysisAreaInTheList } = this.props;

    const commodityOptions = [...new Set(listData.map((list) => list.Commodity))].map(this.createOptions);
    const countryOptions = [...new Set(listData.map((list) => list.Country))].map(this.createOptions);
    const stateOptions = [
      ...new Set(
        listData.filter((location) => location.Country === this.state.selectedCountry).map((list) => list.State)
      ),
    ].map(this.createOptions);
    const subStateOptions = [
      ...new Set(
        listData
          .filter(
            (location) => location.Country === this.state.selectedCountry && location.State === this.state.selectedState
          )
          .map((list) => list['Sub State'])
      ),
    ].map(this.createOptions);
    const companyOptions = [...new Set(listData.map((list) => list['Company Name']))].map(this.createOptions);

    const dropdownOptionsMethodsCommodity = buildDropdownOptions(commodityOptions, 'id', this.state.selectedCommodity);
    const dropdownOptionsMethodsCountry = buildDropdownOptions(countryOptions, 'id', this.state.selectedCountry);
    const dropdownOptionsMethodsState = buildDropdownOptions(stateOptions, 'id', this.state.selectedState);
    const dropdownOptionsMethodsSubstate = buildDropdownOptions(subStateOptions, 'id', this.state.selectedSubState);
    const dropdownOptionsMethodsCompany = buildDropdownOptions(companyOptions, 'id', this.state.selectedCompany);

    const {
      selectedAreaMin,
      selectedAreaMax,
      selectedCountry,
      selectedState,
      selectedSubState,
      selectedCompany,
      selectedCommodity,
      showCertified,
      showFlagged,
      showGreen,
      showOrange,
    } = this.state;

    return (
      <div>
        <ModalWrapper onClose={this.close} theme="no-download">
          <div className="filter-container">
            <div className="filter-info-container">
              <div className="filter-info">
                <div className="filter-info-item dropdown-group">
                  <GfwSelect
                    options={dropdownOptionsMethodsCommodity.dropdownOptions}
                    value={dropdownOptionsMethodsCommodity.value}
                    onChange={this.changeCommodity}
                  />
                  {selectedCommodity && (
                    <button className="gfw-button clear-button" onClick={this.clearCommodityDropdown}>
                      <span>x</span>
                    </button>
                  )}
                </div>
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
                <div className="filter-info-item dropdown-group">
                  <GfwSelect
                    options={dropdownOptionsMethodsCompany.dropdownOptions}
                    value={dropdownOptionsMethodsCompany.value}
                    onChange={this.changeCompany}
                  />
                  {selectedCompany && (
                    <button className="gfw-button clear-button" onClick={this.clearCompanyDropdown}>
                      <span>x</span>
                    </button>
                  )}
                </div>
                <div className="filter-info-item">
                  <input
                    id="show-flagged"
                    checked={showCertified}
                    onChange={this.changeShowCertified}
                    type="checkbox"
                  />
                  <label htmlFor="show-flagged">Show Certified</label>
                </div>
                <div className="filter-info-item">
                  <span>Calculated Sourcing Area</span>
                  <AreaFilterSlider
                    onChange={this.changeAreaRange}
                    maximumAnalysisAreaInTheList={maximumAnalysisAreaInTheList}
                    value={[selectedAreaMin, selectedAreaMax]}
                  />
                  />
                </div>
                <div className="filter-info-item">
                  <input id="show-flagged" checked={showFlagged} onChange={this.changeShowFlagged} type="checkbox" />
                  <label htmlFor="show-flagged">Show Flagged</label>
                </div>
              </div>
              <div className="filter-info">
                <div className="filter-info-item filter-circle">
                  <input
                    id="show-green"
                    checked={showGreen && !showOrange}
                    onChange={this.changeShowGreen}
                    type="checkbox"
                  />
                  <label htmlFor="show-green">All</label>{' '}
                  <div className="filter-icons-container green">
                    <svg className="list-icons">
                      <use className="analysis-header-click" xlinkHref="#circle-list" />
                    </svg>
                  </div>
                </div>
                <div className="filter-info-item filter-circle">
                  <input
                    id="show-orange"
                    checked={showOrange && !showGreen}
                    onChange={this.changeShowOrange}
                    type="checkbox"
                  />
                  <label htmlFor="show-orange">At least one</label>{' '}
                  <div className="filter-icons-container orange">
                    <svg className="list-icons">
                      <use className="analysis-header-click" xlinkHref="#circle-list" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="filter-update">
              <div className="filter-info-item">
                <input
                  type="button"
                  className={`gfw-button btn-green list-filters-columns ${
                    this.props.filterCount === 0 ? 'disabled-button' : 'active-button'
                  }`}
                  disabled={this.props.filterCount === 0}
                  value="Clear Filters"
                  onClick={this.props.clearFilters}
                />
                <input
                  type="button"
                  className="gfw-button btn-green"
                  value="Update Values"
                  onClick={this.updateValues}
                />
              </div>
            </div>
          </div>
        </ModalWrapper>
      </div>
    );
  }
}
