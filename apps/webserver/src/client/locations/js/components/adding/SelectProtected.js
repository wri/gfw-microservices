import { locationsPage } from '../../../../common/js/config';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';
import esriRequest from 'esri/request';
// import utils from 'map/js/utils/AppUtils';
import React, { Component } from 'react';

export default class SelectProtected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      protectedValue: '',
      protectedOptions: [],
    };
  }

  componentDidMount() {
    // const protectedAreasConfig = utils.getObject(locationsPage.add, 'id', 'protectedAreas');
    // console.log('protectedAreasConfig', protectedAreasConfig);
    // console.log('hostname', location.hostname);
    // Make sure all requests that use tokens have them

    esriRequest.setRequestPreCallback((ioArgs) => {
      if (ioArgs.url.search(locationsPage.add.protectedAreasUrl) > -1) {
        ioArgs.content.token = locationsPage.add.protectedAreas[location.hostname];
      }
      return ioArgs;
    });

    const protectedAreaQT = new QueryTask(
      'https://gis-gfw.wri.org/arcgis/rest/services/cached/wdpa_protected_areas/MapServer/0'
    );
    const query = new Query();
    query.returnGeometry = false;
    query.outFields = ['name'];
    query.where = '1=1';
    query.returnDistinctValues = true;

    protectedAreaQT.execute(query).then(this.assignProtected);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.protectedValue !== prevState.protectedValue) {
      this.queryProtected();
    }
  }

  assignProtected = (res) => {
    const protectedFeats = [];
    res.features.forEach((feature) => {
      protectedFeats.push(feature.attributes.name);
    });
    protectedFeats.sort();
    this.setState({ protectedOptions: protectedFeats });
  };

  queryProtected = () => {
    const url =
      'https://gis-gfw.wri.org/arcgis/rest/services/cached/wdpa_protected_areas/MapServer/0';
    const loggingQT = new QueryTask(url);

    const query = new Query();
    query.returnGeometry = true;
    query.geometryPrecision = 1000;
    query.outFields = [];
    query.where = "name = '" + this.state.protectedValue + "'";

    loggingQT.execute(query).then(this.deduceAdmin);
  };

  deduceAdmin = (result) => {
    if (result.features && result.features.length > 0) {
      this.props.setGeometry(result.features[0].geometry);
    }
  };

  selectProtected = (evt) => {
    this.setState({ protectedValue: evt.target.value });
    if (evt.target.value !== 'Select Protected Area') {
      this.props.setName(evt);
    }
  };

  createProtected = (protectedFeat, j) => {
    return (
      <option key={j} id={protectedFeat}>
        {protectedFeat}
      </option>
    );
  };

  render() {
    return (
      <div
        className={`locations-add-subpage ${
          this.props.addMethod === 'byProtected' ? '' : 'hidden'
        }`}
      >
        <div className="locations-add-subpage__content">
          <select
            onChange={this.selectProtected}
            className="locations-select"
            value={this.state.protected}
          >
            <option>Select Protected Area</option>
            {this.state.protectedOptions.map(this.createProtected)}
          </select>
        </div>
      </div>
    );
  }
}
