import React, { Component } from 'react';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { locationsPage } from '../../../../common/js/config';

export default class CountryStateSubStateFilter extends Component {
  componentDidUpdate() {
    this.autoSelectSingleOptions();
  }

  componentDidMount() {
    this.autoSelectSingleOptions();
  }

  autoSelectSingleOptions = () => {
    if (
      this.props.countries.dropdownOptions.length === 1 &&
      this.props.selectedCountry !== this.props.countries.dropdownOptions[0].value
    ) {
      this.props.onCountryChange(this.props.countries.dropdownOptions[0]);
    }
    if (
      this.props.states.dropdownOptions.length === 1 &&
      this.props.selectedState !== this.props.states.dropdownOptions[0].value
    ) {
      this.props.onStateChange(this.props.states.dropdownOptions[0]);
    }
    if (
      this.props.subStates.dropdownOptions.length === 1 &&
      this.props.selectedSubState !== this.props.subStates.dropdownOptions[0].value
    ) {
      this.props.onSubStateChange(this.props.subStates.dropdownOptions[0]);
    }
  };

  render() {
    const {
      countries,
      selectedCountry,
      onCountryChange,
      states,
      selectedState,
      onStateChange,
      subStates,
      onSubStateChange,
    } = this.props;

    return (
      <div className="country-state-substate-filter">
        <div className="dropdown-group input-field__block-container">
          <label htmlFor="country_select" className="block-label">
            {locationsPage.lists.selectCountry}
          </label>
          <GfwSelect
            id="country_select"
            className="dropdown-group__dropdown"
            options={countries.dropdownOptions}
            value={countries.value}
            onChange={onCountryChange}
            placeholder={locationsPage.lists.selectPlaceholder}
          />
        </div>
        <div className="dropdown-group input-field__block-container">
          <label htmlFor="state_select" className="block-label">
            {locationsPage.lists.selectState}
          </label>
          <GfwSelect
            id="state_select"
            className="dropdown-group__dropdown"
            options={states.dropdownOptions}
            value={states.value}
            disabled={!selectedCountry || states.dropdownOptions.length === 0}
            onChange={onStateChange}
            placeholder={locationsPage.lists.selectPlaceholder}
          />
        </div>
        <div className="dropdown-group input-field__block-container">
          <label htmlFor="substate_select" className="block-label">
            {locationsPage.lists.selectSubState}
          </label>
          <GfwSelect
            id="substate_select"
            className="dropdown-group__dropdown"
            options={subStates.dropdownOptions}
            value={subStates.value}
            disabled={!selectedState || subStates.dropdownOptions.length === 0}
            onChange={onSubStateChange}
            placeholder={locationsPage.lists.selectPlaceholder}
          />
        </div>
      </div>
    );
  }
}
