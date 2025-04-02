import React, { Component } from 'react';
import { executeQueryJSON } from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { updateAdminSelections } from '../../actions/mapActions';
import * as analysisActions from '../../actions/analysisActions';
import store from '../../store';
import GfwButton from '../../../../common/js/components/GfwButton';
import {
  getGadmService,
  getListOfCountries,
  getListOfStatesOrProvinces,
} from '../../../../common/js/utils/getGadmService.utils';
import { ThemeProvider } from '../../../../styles/ThemeProvider';

export default class SelectAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countryOptions: [],
      stateOrProvinceOptions: [],
      filterStr: '',
    };
  }

  // When the component mounts - query all countries to populate country level dropdown
  componentDidMount() {
    getListOfCountries().then(({ countryOptions }) => {
      this.setState({
        countryOptions,
      });
    });
  }

  // If a country was chosen (and different) - query to determine it's sub-admin area to populate sub-level dropdown
  componentDidUpdate(prevProps) {
    if (prevProps.adminSelections.country !== this.props.adminSelections.country) {
      getListOfStatesOrProvinces(this.props.adminSelections.countryISO).then(
        ({ stateOrProvinceOptions }) => {
          this.setState({
            stateOrProvinceOptions,
          });
        }
      );
    }
  }

  setCountry = (evt) => {
    const selectedISO = evt.target.value;
    const selectedCountry = this.state.countryOptions.find((c) => c.iso === selectedISO);

    this.setState({ selectedCountry, selectedStateOrProvince: '' });

    store.dispatch(
      updateAdminSelections({
        country: selectedCountry.name_0,
        countryISO: selectedCountry.iso,
        stateOrProvince: '',
      })
    );

    this.props.setAdmin({
      country: selectedCountry.name_0,
      countryISO: selectedCountry.iso,
      stateOrProvince: '',
    });
  };

  setStateOrProvince = (evt) => {
    const selectedGid1 = evt.target.value;
    const selectedStateOrProvince = this.state.stateOrProvinceOptions.find(
      (c) => c.gid_1 === selectedGid1
    );

    this.setState({ selectedStateOrProvince: selectedGid1 });

    store.dispatch(
      updateAdminSelections({
        country: this.state.selectedCountry.name_0,
        stateOrProvince: selectedStateOrProvince.name_1,
      })
    );

    this.props.setAdmin({
      stateOrProvince: selectedStateOrProvince.name_1,
    });
  };

  analyzeAdmin = () => {
    const { selectedStateOrProvince, selectedCountry, stateOrProvinceOptions } = this.state;

    const selectedCountryISO = selectedCountry.iso;

    // the /dataApi/analysisAdminRegion endpoint expects the index of the state / province
    // TODO update the endpoint so we send the gid_1 instead
    const region = selectedStateOrProvince
      ? stateOrProvinceOptions.findIndex((c) => c.gid_1 === selectedStateOrProvince) + 1
      : '';

    this.props.analyzeAdmin({
      country: selectedCountryISO,
      region,
    });

    store.dispatch(
      analysisActions.setAnalysisAdminArea({
        country: selectedCountryISO,
        region,
      })
    );
  };

  subscribeAdmin = () => {
    // TODO: update to GADM 4.1
    const adminServiceURL = getGadmService();
    const { adminSelections } = this.props;

    const queryUrl = adminServiceURL;

    const query = new Query();
    query.where =
      adminSelections.stateOrProvince.length !== 0
        ? `name_0 = '${adminSelections.country}' AND name_1 = '${adminSelections.stateOrProvince}'`
        : `name_0 = '${adminSelections.country}'`;

    query.returnGeometry = false;
    query.outFields = ['gadmid']; // ['name_0', 'name_1', 'name_2', 'gadmid'];// 'gadmid'

    executeQueryJSON(queryUrl, query).then((res) => {
      let gadmId =
        res && res.features && res.features.length > 0 ? res.features[0].attributes.gadmid : '';
      if (gadmId !== '') {
        const gadmLevels = gadmId.split('.');
        gadmId =
          adminSelections.stateOrProvince === ''
            ? gadmLevels[0]
            : `${gadmLevels[0]}.${gadmLevels[1]}`;
      }
      this.props.subscribeAdmin({
        country: this.props.adminSelections.country,
        region: this.props.adminSelections.stateOrProvince,
        gadmId,
      });
    });
  };

  searchCountries = (evt) => {
    this.setState({ filterStr: evt.target.value });
  };

  render() {
    const {
      countryOptions,
      filterStr,
      stateOrProvinceOptions,
      selectedStateOrProvince,
      selectedCountry,
    } = this.state;
    const { analysisResults } = this.props;
    const filteredStateOrProvinceNames = stateOrProvinceOptions.filter(
      ({ name_1 }) => !!name_1?.toLowerCase().includes(filterStr.toLowerCase())
    );

    return (
      <ThemeProvider>
        <div className="aa">
          <div className="locations-add-subpage__content">
            <div className="select-administrative-region__country-dropdown dropdown-group">
              <Select
                sx={{ width: 200 }}
                value={selectedCountry?.iso || ''}
                onChange={this.setCountry}
                displayEmpty
                renderValue={(selected) =>
                  selected
                    ? countryOptions.find((c) => c.iso === selected)?.name_0
                    : 'SELECT COUNTRY'
                }
              >
                <MenuItem value="" disabled>
                  SELECT COUNTRY
                </MenuItem>
                {countryOptions.map(({ iso, name_0 }) => (
                  <MenuItem key={iso} value={iso}>
                    {name_0}
                  </MenuItem>
                ))}
              </Select>
            </div>
            {selectedCountry && (
              <div
                className={`region-countries-search-container ${
                  this.props.adminSelections.country ? '' : 'hidden'
                }`}
              >
                <svg className="svg-icon">
                  <use xlinkHref="#icon-control-search" />
                </svg>
                <input
                  className="region-countries-search"
                  value={filterStr}
                  onChange={this.searchCountries}
                />
              </div>
            )}
            <div
              className={`select-administrative-region__smaller-region-dropdown ${
                this.props.adminSelections.country ? '' : 'hidden'
              } dropdown-group`}
            >
              {selectedCountry && (
                <Select
                  sx={{ width: 200 }}
                  value={selectedStateOrProvince || ''}
                  onChange={this.setStateOrProvince}
                  displayEmpty
                  renderValue={(selected) =>
                    selected
                      ? this.state.stateOrProvinceOptions.find((c) => c.gid_1 === selected)?.name_1
                      : 'Select State/Province'
                  }
                >
                  <MenuItem value="" disabled>
                    Select State/Province
                  </MenuItem>
                  {filteredStateOrProvinceNames.map(({ gid_1, name_1 }) => (
                    <MenuItem key={gid_1} value={gid_1}>
                      {name_1}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </div>
          </div>
          <div
            className={`select-administrative-region-actions ${
              analysisResults && analysisResults.data ? 'hidden' : ''
            }`}
          >
            <GfwButton
              classNames="AnalysisPanel__button btn-green text__semi-bold-12"
              value="ANALYZE"
              disabled={this.props.adminSelections.country === ''}
              onClick={this.analyzeAdmin}
            />
            <GfwButton
              classNames="AnalysisPanel__button btn-green text__semi-bold-12"
              value="ADD LOCATION"
              disabled={this.props.adminSelections.country === ''}
              onClick={this.subscribeAdmin}
            />
          </div>
        </div>
      </ThemeProvider>
    );
  }
}
