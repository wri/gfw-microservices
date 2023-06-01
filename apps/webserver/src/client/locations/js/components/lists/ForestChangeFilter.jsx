/* eslint-disable no-undef */
import React, { Component } from 'react';
import ModalWrapper from '../modals/ModalWrapper';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import store from '../../store';
import { toggleCanopyModal, updateFilters, setFilterCount } from '../../actions/locationActions';
import { locationsPage } from '../../../../common/js/config';
import Button from '../../../../common/js/components/Button';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import AreaFilterSlider from './AreaFilterSlider';
import '../../../../common/css/_irsBase.scss';
import '../../../../common/css/_irsStyle.scss';
import '../../../../common/css/filter-dialogs.scss';
import { filterKeys } from '../../../../common/js/constants/lists.constants';

const createSelectOptions = (value) => {
  return {
    id: value,
    label: value,
  };
};
export default class ForestChangeFilter extends Component {
  constructor(props) {
    super(props);
    this.state = { ...locationsPage.defaultFilterValues };
    this.initialState = this.state;
  }

  componentDidMount() {
    if ($('#tree-cover-extent-slider').ionRangeSlider) {
      $('#tree-cover-extent-slider').ionRangeSlider({
        type: 'double',
        min: 0,
        max: 100,
        onFinish: this.changeTreeCoverExtent,
        prettify: (value) => `${value}%`,
      });
    }
    if ($('#tree-cover-loss-slider').ionRangeSlider) {
      $('#tree-cover-loss-slider').ionRangeSlider({
        type: 'double',
        min: 0,
        max: 100,
        onFinish: this.changeTreeCoverLoss,
        prettify: (value) => `${value}%`,
      });
    }
    if ($('#tree-cover-loss-primary-forest-slider').ionRangeSlider) {
      $('#tree-cover-loss-primary-forest-slider').ionRangeSlider({
        type: 'double',
        min: 0,
        max: 100,
        onFinish: this.changeTreeCoverLossPrimaryForest,
        prettify: (value) => `${value}%`,
      });
    }
    if ($('#tree-cover-loss-protected-areas-slider').ionRangeSlider) {
      $('#tree-cover-loss-protected-areas-slider').ionRangeSlider({
        type: 'double',
        min: 0,
        max: 100,
        onFinish: this.changeTreeCoverLossProtectedAreas,
        prettify: (value) => `${value}%`,
      });
    }
    if ($('#tree-cover-slider').ionRangeSlider) {
      $('#tree-cover-slider').ionRangeSlider({
        type: 'single',
        values: [0, 10, 15, 20, 25, 30, 50, 75, 100],
        hide_min_max: true,
        grid_snap: true,
        to_fixed: true,
        from_min: 1,
        from_max: 7,
        grid: true,
        from: 5,
        onFinish: this.changeCanopyDensity,
        prettify: (value) => `${value}%`,
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { filterValues, filterCount } = this.props;
    if (
      JSON.stringify(filterValues) !== JSON.stringify(nextProps.filterValues) ||
      (filterCount !== 0 && nextProps.filterCount === 0 && nextProps.listView === 'forest_change')
    ) {
      this.setState(this.initialState);
    }
  }

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

  changeAreaRange = (_evt, newValue) => {
    this.setState({
      selectedAreaMin: newValue[0],
      selectedAreaMax: newValue[1],
    });
  };

  changeTreeCoverExtent = (data) => {
    this.setState({
      treeCoverExtentMin: data.from,
      treeCoverExtentMax: data.to,
    });
  };

  changeTreeCoverLossPrimaryForest = (data) => {
    this.setState({
      treeCoverLossPrimaryForestMin: data.from,
      treeCoverLossPrimaryForestMax: data.to,
    });
  };

  changeTreeCoverLossProtectedAreas = (data) => {
    this.setState({
      treeCoverLossProtectedAreasMin: data.from,
      treeCoverLossProtectedAreasMax: data.to,
    });
  };

  changeCanopyDensity = (data) => {
    this.setState({
      canopyDensity: data.from_value,
    });
  };

  updateValues = (state) => {
    let filterCount = 0;
    Object.keys(state).forEach((key) => {
      if (filterKeys.includes(key) && !!state[key]) {
        filterCount += 1;
      }
    });

    store.dispatch(toggleCanopyModal());
    store.dispatch(updateFilters(state));
    store.dispatch(setFilterCount(filterCount));

    gtag('event', 'list table filter', {
      'event_category': 'Lists Click',
      'event_label': 'user filtered the lists table',
    });
  };

  close = () => {
    const { filterCount } = this.props;
    if (filterCount === 0) {
      this.setState(this.initialState);
    }
    store.dispatch(toggleCanopyModal());
  };

  changeTreeCoverLoss(data) {
    this.setState({
      treeCoverLossMin: data.from,
      treeCoverLossMax: data.to,
    });
  }

  render() {
    const { filterValues, maximumAnalysisAreaInTheList } = this.props;
    const { selectedCountry, selectedState, selectedSubState, selectedAreaMin, selectedAreaMax } =
      this.state;

    const countryList = Object.keys(filterValues);
    const countryOptions = countryList.map(createSelectOptions);

    const stateList =
      selectedCountry && selectedCountry in filterValues
        ? Object.keys(filterValues[selectedCountry])
        : [];
    const stateOptions = stateList.map(createSelectOptions);

    const subStateList = selectedState ? filterValues[selectedCountry][selectedState] : [];
    const subStateOptions = subStateList.map(createSelectOptions);

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

    return (
      <div>
        <ModalWrapper
          onClose={this.close}
          modalTitle={locationsPage.lists.filterModalTitle}
          theme="no-download"
          widthControl="forest-change-filter-container"
        >
          <CountryStateSubStateFilter
            countries={dropdownOptionsMethodsCountry}
            selectedCountry={selectedCountry}
            onCountryChange={(e) => this.changeCountry(e)}
            states={dropdownOptionsMethodsState}
            selectedState={selectedState}
            onStateChange={(e) => this.changeState(e)}
            subStates={dropdownOptionsMethodsSubstate}
            selectedSubState={selectedSubState}
            onSubStateChange={(e) => this.changeSubState(e)}
          />
          <div className="block-label label">Calculated Sourcing Area </div>
          <AreaFilterSlider
            onChange={this.changeAreaRange}
            maximumAnalysisAreaInTheList={maximumAnalysisAreaInTheList}
            value={[selectedAreaMin, selectedAreaMax]}
          />
          <div className="dialog__footer">
            <Button
              variant="primary"
              onClick={() => this.updateValues(this.state)}
              label={locationsPage.lists.applyFilters}
            />
          </div>
        </ModalWrapper>
      </div>
    );
  }
}
