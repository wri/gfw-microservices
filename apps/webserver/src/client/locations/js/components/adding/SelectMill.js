import { locationsPage } from '../../../../common/js/config';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';
import React, { Component } from 'react';
import SetArea from './SetArea';

export default class SelectMill extends Component {
  constructor(props) {
    super(props);
    this.state = {
      millOptions: [],
      filterStr: '',
      mill: '',
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.mill !== prevState.mill) {
      this.queryMills();
    }
  }

  queryMills = () => {
    const queryTask = new QueryTask({
      url: locationsPage.updatedPalmOilMillUrl,
    });
    const query = new Query();

    query.where = "mill_name_ = '" + this.state.mill + "'";
    query.returnGeometry = true;
    query.outFields = [];
    queryTask.execute(query).then((res) => {
      if (res.features && res.features.length && res.features.length > 0) {
        this.props.setGeometry(res.features[0].geometry);
      }
    });
  };

  componentDidMount() {
    const queryTask = new QueryTask({
      url: locationsPage.updatedPalmOilMillUrl,
    });
    const query = new Query();

    query.where = '1=1';
    query.returnGeometry = false;
    query.outFields = ['mill_name_'];
    query.returnDistinctValues = true;
    queryTask.execute(query).then((res) => {
      const uniqueMills = [];
      res.features.map((feature) => uniqueMills.push(feature.attributes.mill_name_));
      uniqueMills.sort();
      this.setState({
        millOptions: uniqueMills,
      });
    });
  }

  setMill = (evt) => {
    this.setState({
      mill: evt.target.value,
    });
    this.props.setMill(evt);
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

  setArea = (evt) => {
    this.props.setArea(evt.target.id, '');
  };

  setCustom = (evt) => {
    if (!isNaN(evt.target.value)) {
      this.props.setArea('', evt.target.value);
    }
  };

  createOptions = (option, j) => {
    return <option key={j}>{option}</option>;
  };

  filterMills = (evt) => {
    this.setState({ filterStr: evt.target.value });
  };

  render() {
    const countryOption = this.createCountry();
    const stateOption = this.createState();
    const subStateOption = this.createSubState();

    const filteredMills = this.state.millOptions.filter((mill) => {
      return mill.toLowerCase().includes(this.state.filterStr.toLowerCase());
    });

    return (
      <div
        className={`locations-add-subpage mill-form__container ${
          this.props.addMethod === 'byPalmMill' ? '' : 'hidden'
        }`}
      >
        <div className="locations-add-subpage__content locations-subpage-section-left">
          <input
            className="profile-manager-search"
            onChange={this.filterMills}
            placeholder="Search Palm Oil Mills..."
          />

          <select onChange={this.setMill} className="locations-subpage-select-custom" size="10">
            {filteredMills.map(this.createOptions)}
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
        <div className="locations-subpage-section-right">
          <SetArea
            measurementUnit={this.props.measurementUnit}
            setMeaurementUnit={this.props.setMeaurementUnit}
            areaAround={this.props.areaAround}
            customArea={this.props.customArea}
            calculatedArea={this.props.calculatedArea}
            setCustom={this.setCustom}
            setArea={this.setArea}
          />
        </div>
      </div>
    );
  }
}
