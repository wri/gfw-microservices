import React, { Component } from 'react';
import ModalWrapper from '../modals/ModalWrapper';
import store from '../../../../locations/js/store';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
  removeList,
} from '../../../../locations/js/actions/locationActions';
import { locationsPage } from '../../../../common/js/config';
import Button from '../../../../common/js/components/Button';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import Select from 'react-select';
import '../../../../common/css/filter-dialogs.scss';

export default class GFWProtectedForestChangeFilter extends Component {
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
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  changeState = (evt) => {
    this.setState({
      selectedState: evt.value,
      selectedSubState: '',
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  changeSubState = (evt) => {
    this.setState({
      selectedSubState: evt.value,
      selectedDesignationType: '',
      selectedDesignation: '',
      selectedNames: [],
    });
  };

  changeDesignationType = (evt) => {
    this.setState({
      selectedDesignationType: evt.value,
    });
  };

  changeDesignation = (evt) => {
    this.setState({
      selectedDesignation: evt.value,
    });
  };

  changeNames = (values) => {
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

  resetFilters = () => {
    this.props.clearFilters();
    store.dispatch(toggleCanopyModal());
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
    const { protectedAreas } = this.props;
    const {
      selectedCountry,
      selectedState,
      selectedSubState,
      selectedDesignationType,
      selectedDesignation,
      selectedNames,
    } = this.state;

    const countryOptions = [
      ...new Set(
        protectedAreas.filter((location) => location.Country !== '').map((list) => list.Country)
      ),
    ].map(this.createOptions);
    const stateOptions = [
      ...new Set(
        protectedAreas
          .filter((location) => location.Country === selectedCountry && location.State !== '')
          .map((list) => list.State)
      ),
    ].map(this.createOptions);
    const subStateOptions = [
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
    ].map(this.createOptions);
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
    ].map(this.createOptions);
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
    ].map(this.createOptions);

    const namesOptions = [
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
    const dropdownOptionsMethodsDesignationType = buildDropdownOptions(
      designationTypeOptions,
      'id',
      selectedDesignationType
    );
    const dropdownOptionsMethodsDesignation = buildDropdownOptions(
      designationOptions,
      'id',
      selectedDesignation
    );
    return (
      <div>
        <ModalWrapper
          onClose={this.close}
          modalTitle={locationsPage.lists.protectedFiltersModalHeader}
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

          <hr />

          <div className="dropdown-group input-field__block-container">
            <label htmlFor="designation_type" className="block-label">
              {locationsPage.lists.designationTypeLabel}
            </label>
            <GfwSelect
              id="designation_type"
              className="dropdown-group__dropdown"
              options={dropdownOptionsMethodsDesignationType.dropdownOptions}
              value={dropdownOptionsMethodsDesignationType.value}
              onChange={this.changeDesignationType}
              placeholder={locationsPage.lists.selectPlaceholder}
            />
          </div>
          <div className="dropdown-group input-field__block-container">
            <label htmlFor="designation" className="block-label">
              {locationsPage.lists.designationLabel}
            </label>
            <GfwSelect
              id="designation"
              className="dropdown-group__dropdown"
              options={dropdownOptionsMethodsDesignation.dropdownOptions}
              value={dropdownOptionsMethodsDesignation.value}
              onChange={this.changeDesignation}
              placeholder={locationsPage.lists.selectPlaceholder}
            />
          </div>

          <hr />

          <Select
            options={namesOptions}
            maxMenuHeight={150}
            onChange={this.changeNames}
            isMulti={true}
            isSearchable={true}
            placeholder={locationsPage.lists.protectedAreasPlaceholder}
            value={selectedNames}
          />

          <div className="dialog__footer">
            <Button
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
