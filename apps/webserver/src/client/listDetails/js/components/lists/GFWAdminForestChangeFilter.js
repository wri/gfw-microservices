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
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import Select from 'react-select';
import '../../../../common/css/filter-dialogs.scss';

export default class GFWAdminForestChangeFilter extends Component {
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
    if (this.state.selectedCountry !== evt.value) {
      this.setState({
        selectedStates: [],
        selectedSubStates: [],
      });
    }
    this.setState({
      selectedCountry: evt.value,
    });
  };

  changeStates = (states) => {
    this.setState({
      selectedStates: states.map((s) => s.value),
      selectedSubStates: [],
    });
  };

  changeSubstates = (subStates) => {
    this.setState({ selectedSubStates: subStates.map((s) => s.value) });
  };

  searchNames = (evt, key) => {
    this.setState({ [key]: evt.target.value });
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

  createMultiOptions = (option, i) => {
    return (
      <option value={option.label} id={option.id} key={i}>
        {option.label}
      </option>
    );
  };

  clearCountryDropdown = () => {
    this.setState({
      selectedCountry: '',
    });
  };

  makeOption = (v) => {
    return { value: v, label: v };
  };

  render() {
    const { adminAreas } = this.props;
    const { selectedCountry, selectedStates, selectedSubStates, filterState, filterSubstate } =
      this.state;

    const countryOptions = [
      ...new Set(
        adminAreas.filter((location) => location.Country !== '').map((list) => list.Country)
      ),
    ].map(this.createOptions);
    const stateOptions = [
      ...new Set(
        adminAreas
          .filter(
            (location) =>
              location.State &&
              location.State !== '' &&
              location.State !== ' ' &&
              location.State.toLowerCase().includes(filterState.toLowerCase()) &&
              location.Country === selectedCountry
          )
          .map((list) => list.State)
      ),
    ].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const selectStateOptions = stateOptions.map(this.makeOption);
    const subStateOptions = [
      ...new Set(
        adminAreas
          .filter(
            (location) =>
              location['Sub State'] &&
              location['Sub State'] !== '' &&
              location['Sub State'] !== ' ' &&
              location['Sub State'].toLowerCase().includes(filterSubstate.toLowerCase()) &&
              location.Country === selectedCountry &&
              // if there are NO selected states then show all
              (selectedStates.length === 0 ||
                // If there ARE selected states then filter by the selected state
                (selectedStates.length !== 0 && selectedStates.indexOf(location.State) !== -1))
          )
          .map((list) => list['Sub State'])
      ),
    ].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const selectSubStateOptions = adminAreas
      .filter(
        (area) =>
          area.Country === selectedCountry &&
          area['Sub State'] !== '' &&
          selectedStates.includes(area.State)
      )
      .map((area) => area['Sub State'])
      .map(this.makeOption);
    const dropdownOptionsMethodsCountry = buildDropdownOptions(
      countryOptions,
      'id',
      selectedCountry
    );
    return (
      <div>
        <ModalWrapper
          onClose={this.close}
          modalTitle={locationsPage.lists.adminFilters.modalHeader}
          theme="no-download"
          widthControl="forest-change-filter-container-gfw"
        >
          <div className="admin-area-row input-field__block-container">
            <label htmlFor="multiselect_country" className="block-label">
              {locationsPage.lists.adminFilters.selectCountryLabel}
            </label>
            <Select
              inputId="multiselect_country"
              maxMenuHeight={150}
              options={dropdownOptionsMethodsCountry.dropdownOptions}
              onChange={this.changeCountry}
              placeholder={locationsPage.lists.adminFilters.selectCountry}
            ></Select>
          </div>
          <div className="admin-area-row input-field__block-container">
            <label htmlFor="multiselect_state" className="block-label">
              {locationsPage.lists.adminFilters.selectStatesLabel}
            </label>
            <Select
              inputId="multiselect_state"
              maxMenuHeight={150}
              value={selectedStates.map(this.makeOption)}
              options={selectStateOptions}
              onChange={this.changeStates}
              placeholder={locationsPage.lists.adminFilters.selectStates}
              isMulti={true}
              isSearchable={true}
            ></Select>
          </div>
          <div className="admin-area-row input-field__block-container">
            <label htmlFor="multiselect_substate" className="block-label">
              {locationsPage.lists.adminFilters.selectSubstatesLabel}
            </label>
            <Select
              inputId="multiselect_substate"
              maxMenuHeight={150}
              value={selectedSubStates.map(this.makeOption)}
              options={selectSubStateOptions}
              onChange={this.changeSubstates}
              placeholder={locationsPage.lists.adminFilters.selectSubstates}
              isMulti={true}
              isSearchable={true}
            ></Select>
          </div>

          <div className="dialog__footer">
            <Button
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
              label={locationsPage.lists.adminFilters.apply}
            />
            <Button variant="secondary" onClick={this.close} label={locationsPage.lists.cancel} />
          </div>
        </ModalWrapper>
      </div>
    );
  }
}
