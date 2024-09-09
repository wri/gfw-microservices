import React, { Component } from 'react';
import { Stack, Button as MaterialButton, Badge, Box } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import {
  toggleCanopyModal,
  updateFilters,
  setFilterCount,
} from '../../../../../locations/js/actions/locationActions';
import { defaultFilterValues } from '../defaultFilterValues';
import Button from '../../../../../common/js/components/Button';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';
import ColumnSelector from './ColumnSelector';
import { filterKeys } from '../../../../../common/js/constants/lists.constants';
import store from '../../../../../locations/js/store';
import '../../../../../common/css/_irsBase.scss';
import '../../../../../common/css/_irsStyle.scss';
import '../../../../../common/css/filter-dialogs.scss';

export default class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultFilterValues };
    this.initialState = this.state;
  }

  changeCountry = (evt) => {
    this.setState({
      selectedCountry: evt.target.value,
      selectedState: '',
      selectedSubState: '',
    });
  };

  changeState = (evt) => {
    this.setState({ selectedState: evt.target.value, selectedSubState: '' });
  };

  changeSubState = (evt) => {
    this.setState({ selectedSubState: evt.target.value });
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
      event_category: 'Lists Click',
      event_label: 'user filtered the lists table',
    });
  };

  resetFilters = () => {
    this.setState(this.initialState, () => {
      store.dispatch(toggleCanopyModal());
      store.dispatch(updateFilters(this.initialState));
      store.dispatch(setFilterCount(0));
    });
  };

  render() {
    const { filterValues, canopyModalVisible, filterCount, listColumns, setListColumns } =
      this.props;
    const { selectedCountry, selectedState, selectedSubState } = this.state;

    const countryList = Object.keys(filterValues).filter((name) => name !== 'null');

    const stateList =
      selectedCountry && selectedCountry in filterValues
        ? Object.keys(filterValues[selectedCountry])
        : [];

    const subStateList = selectedState ? filterValues[selectedCountry][selectedState] : [];

    return (
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{ paddingBottom: '10px' }}
      >
        {canopyModalVisible && (
          <>
            <CountryStateSubStateFilter
              countries={countryList}
              selectedCountry={selectedCountry}
              onCountryChange={this.changeCountry}
              states={stateList}
              selectedState={selectedState}
              onStateChange={this.changeState}
              subStates={subStateList}
              selectedSubState={selectedSubState}
              onSubStateChange={this.changeSubState}
            />

            <Button variant="primary" onClick={() => this.updateValues(this.state)} label="APPLY" />
            <Button variant="secondary" onClick={this.resetFilters} label="CLEAR" />
          </>
        )}

        <Box flexGrow={1} />
        <Stack alignItems="center" direction="row">
          <MaterialButton
            sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
            onClick={() => store.dispatch(toggleCanopyModal())}
          >
            {!canopyModalVisible && filterCount > 0 ? (
              <Badge
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#97bd3d',
                    color: 'white',
                  },
                }}
                badgeContent={filterCount}
                overlap="circular"
              >
                <FilterAltIcon
                  sx={{
                    color: 'black',
                    marginRight: '10px',
                    fontSize: '25px',
                    marginTop: '3px',
                  }}
                />
              </Badge>
            ) : (
              <FilterAltIcon
                sx={{
                  color: 'black',
                  marginRight: '10px',
                  fontSize: '25px',
                  marginTop: '3px',
                }}
              />
            )}
          </MaterialButton>
          {canopyModalVisible && (
            <MaterialButton
              sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
              onClick={() => store.dispatch(toggleCanopyModal())}
            >
              <ClearIcon sx={{ color: 'black' }} />
            </MaterialButton>
          )}
          {!canopyModalVisible && (
            <ColumnSelector listColumns={listColumns} setListColumns={setListColumns} />
          )}
        </Stack>
      </Stack>
    );
  }
}
