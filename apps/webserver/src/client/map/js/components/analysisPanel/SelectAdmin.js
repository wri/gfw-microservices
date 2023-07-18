import { executeQueryJSON } from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import React, { Component } from 'react';
import { updateAdminSelections } from '../../actions/mapActions';
import * as analysisActions from '../../actions/analysisActions';
import store from '../../store';
import GfwButton from '../../../../common/js/components/GfwButton';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { getGadmService } from '../../../../common/js/utils/getGadmService.utils';

export default class SelectAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countryOptions: [],
      countryObjects: [],
      smallerOptions: [],
      filterStr: '',
    };
  }

  // When the component mounts - query all countries to populate country level dropdown
  componentDidMount() {
    const queryUrl =
      'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin/MapServer/6';

    const query = new Query();
    query.where = '1=1';
    query.returnGeometry = false;
    query.outFields = ['name_0', 'iso'];
    query.returnDistinctValues = true;
    executeQueryJSON(queryUrl, query).then((res) => {
      const uniqueCountries = [];
      res.features.map((feature) => uniqueCountries.push(feature.attributes.name_0));
      const uniqueAttributes = [...new Set(res.features.map((item) => item.attributes))];
      uniqueCountries.sort();
      this.setState({
        countryOptions: uniqueCountries,
        countryObjects: uniqueAttributes,
      });
    });
  }

  // If a country was chosen (and different) - query to determine it's sub-admin area to populate sub-level dropdown
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.adminSelections.country !== this.props.adminSelections.country) {
      const queryUrl =
        'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin/MapServer/5';
      const query = new Query();
      // we need to add an extra single quote to scape country names with apostrophes (Côte d'Ivoire)
      const scapedCountryName = this.props.adminSelections.country.replace(/'/g, "''");
      query.where = `name_0='${scapedCountryName}'`;
      query.returnGeometry = false;
      query.outFields = ['name_1', 'id_1']; // 'gadmid'
      query.returnDistinctValues = true;
      executeQueryJSON(queryUrl, query).then((res) => {
        const uniqueSubs = [
          ...new Set(
            res.features
              .filter((item) => item.attributes.name_1)
              .map((item) => item.attributes.name_1)
          ),
        ];
        const uniqueAttributes = [
          ...new Set(
            res.features.filter((item) => item.attributes.name_1).map((item) => item.attributes)
          ),
        ];
        uniqueSubs.sort();
        this.setState({
          smallerOptions: uniqueSubs,
          smallerObjects: uniqueAttributes,
        });
      });
    }
  }

  setCountry = (evt) => {
    store.dispatch(
      updateAdminSelections({
        country: evt.value,
        smallerRegion: '',
      })
    );

    this.props.setAdmin({
      country: evt.value,
      smallerRegion: '',
    });
  };

  setSmaller = (evt) => {
    store.dispatch(
      updateAdminSelections({
        country: this.props.adminSelections.country,
        smallerRegion: evt.value,
      })
    );

    this.props.setAdmin({
      smallerRegion: evt.value,
    });
  };

  analyzeAdmin = () => {
    const abbrev = this.state.countryObjects
      ? this.state.countryObjects.filter((obj) => obj.name_0 === this.props.adminSelections.country)
      : [];
    let regionAbbrev;
    if (this.props.adminSelections.smallerRegion && this.state.smallerObjects) {
      regionAbbrev = this.state.smallerObjects.filter(
        (obj) => obj.name_1 === this.props.adminSelections.smallerRegion
      );
    }

    if (regionAbbrev && regionAbbrev[0] && abbrev[0]) {
      this.props.analyzeAdmin({
        country: abbrev[0].iso,
        region: regionAbbrev[0].id_1,
      });
      store.dispatch(
        analysisActions.setAnalysisAdminArea({
          country: abbrev[0].iso,
          region: regionAbbrev[0].id_1,
        })
      );
    } else if (abbrev[0]) {
      this.props.analyzeAdmin({
        country: abbrev[0].iso,
        region: '',
      });
      store.dispatch(
        analysisActions.setAnalysisAdminArea({
          country: abbrev[0].iso,
          region: '',
        })
      );
    }
  };

  subscribeAdmin = () => {
    const adminServiceURL = getGadmService();
    const { adminSelections } = this.props;

    const queryUrl = adminServiceURL;

    const query = new Query();
    query.where =
      adminSelections.smallerRegion.length !== 0
        ? `name_0 = '${adminSelections.country}' AND name_1 = '${adminSelections.smallerRegion}'`
        : `name_0 = '${adminSelections.country}'`;

    query.returnGeometry = false;
    query.outFields = ['gadmid']; // ['name_0', 'name_1', 'name_2', 'gadmid'];// 'gadmid'

    executeQueryJSON(queryUrl, query).then((res) => {
      let gadmId =
        res && res.features && res.features.length > 0 ? res.features[0].attributes.gadmid : '';
      if (gadmId !== '') {
        const gadmLevels = gadmId.split('.');
        gadmId =
          adminSelections.smallerRegion === ''
            ? gadmLevels[0]
            : `${gadmLevels[0]}.${gadmLevels[1]}`;
      }
      this.props.subscribeAdmin({
        country: this.props.adminSelections.country,
        region: this.props.adminSelections.smallerRegion,
        gadmId,
      });
    });
  };

  searchCountries = (evt) => {
    this.setState({ filterStr: evt.target.value });
  };

  clearCountryDropdown = () => {
    store.dispatch(
      updateAdminSelections({
        country: '',
        smallerRegion: '',
      })
    );

    this.setState({ filterStr: '' });
  };

  clearSmallerDropdown = () => {
    store.dispatch(
      updateAdminSelections({
        country: this.props.adminSelections.country,
        smallerRegion: '',
      })
    );
  };

  render() {
    const { countryOptions, filterStr } = this.state;
    const filteredSmallerOptions = this.state.smallerOptions.filter(
      (e) => e.toLowerCase().includes(filterStr.toLowerCase()) || ''
    );
    const { analysisResults } = this.props;

    return (
      <div className="aa">
        <div className="locations-add-subpage__content">
          <div className="select-administrative-region__country-dropdown dropdown-group">
            <GfwSelect
              className="width__200"
              value={this.props.adminSelections.country}
              options={countryOptions}
              onChange={this.setCountry}
              placeholder="Select Country"
            />
            {this.props.adminSelections.country && (
              <button className="gfw-button clear-button-map" onClick={this.clearCountryDropdown}>
                <span>x</span>
              </button>
            )}
          </div>
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
          <div
            className={`select-administrative-region__smaller-region-dropdown ${
              this.props.adminSelections.country ? '' : 'hidden'
            } dropdown-group`}
          >
            <GfwSelect
              value={this.props.adminSelections.smallerRegion}
              options={filteredSmallerOptions}
              onChange={this.setSmaller}
              placeholder="Select State/Province"
            />
            {this.props.adminSelections.smallerRegion && (
              <button className="gfw-button clear-button-map" onClick={this.clearSmallerDropdown}>
                <span>x</span>
              </button>
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
    );
  }
}
