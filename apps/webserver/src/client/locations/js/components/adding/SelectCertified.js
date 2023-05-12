// import {locationsPage} from '../../../../common/js/config';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';
import React, { Component } from 'react';

export default class SelectCertified extends Component {
  constructor(props) {
    super(props);
    this.state = {
      certifiedValue: '',
      certifiedOptions: [],
    };
  }

  componentDidMount() {
    const certifiedAreaQT = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer/1');
    const query = new Query();
    query.returnGeometry = false;
    query.outFields = ['name'];
    query.where = '1=1';
    query.returnDistinctValues = true;

    certifiedAreaQT.execute(query).then(this.assignCertified);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.certifiedValue !== prevState.certifiedValue) {
      this.queryCertified();
    }
  }

  assignCertified = (res) => {
    const certifiedFeats = [];
    res.features.forEach((feature) => {
      certifiedFeats.push(feature.attributes.name);
    });
    certifiedFeats.sort();
    this.setState({ certifiedOptions: certifiedFeats });
  };

  queryCertified = () => {
    const url = 'https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer/1';
    const loggingQT = new QueryTask(url);

    const query = new Query();
    query.returnGeometry = true;
    query.geometryPrecision = 1000;
    query.outFields = [];
    query.where = "name = '" + this.state.certifiedValue + "'";

    loggingQT.execute(query).then(this.deduceAdmin);
  };

  deduceAdmin = (result) => {
    if (result.features && result.features.length > 0) {
      this.props.setGeometry(result.features[0].geometry);
    }
  };

  selectCertified = (evt) => {
    this.setState({ certifiedValue: evt.target.value });
    if (evt.target.value !== 'Select Certified Area') {
      this.props.setName(evt);
    }
  };

  createCertified = (certifiedFeat, j) => {
    return (
      <option key={j} id={certifiedFeat}>
        {certifiedFeat}
      </option>
    );
  };

  createCountry = () => {
    if (this.props.country) {
      return <option>{this.props.country}</option>;
    } else {
      return null;
    }
  };

  createState = () => {
    if (this.props.state) {
      return <option>{this.props.state}</option>;
    } else {
      return null;
    }
  };

  createSubState = () => {
    if (this.props.substate) {
      return <option>{this.props.substate}</option>;
    } else {
      return null;
    }
  };

  render() {
    const countryOption = this.createCountry();
    const stateOption = this.createState();
    const subStateOption = this.createSubState();
    return (
      <div className={`locations-add-subpage ${this.props.addMethod === 'byCertified' ? '' : 'hidden'}`}>
        <div className="locations-add-subpage__content">
          <select onChange={this.selectCertified} className="locations-select" value={this.state.certified}>
            <option>Select Certified Area</option>
            {this.state.certifiedOptions.map(this.createCertified)}
          </select>

          <select
            className="locations-subpage-select"
            disabled
            value={this.props.country ? this.props.country : 'Selected Country'}
          >
            <option>Selected Country</option>
            {countryOption}
          </select>
          <select
            className="locations-subpage-select"
            disabled
            value={this.props.state ? this.props.state : 'Selected State/Province'}
          >
            <option>Selected State/Province</option>
            {stateOption}
          </select>
          <select
            className="locations-subpage-select"
            disabled
            value={this.props.substate ? this.props.substate : 'Selected Substate'}
          >
            <option>Selected Substate</option>
            {subStateOption}
          </select>
        </div>
      </div>
    );
  }
}
