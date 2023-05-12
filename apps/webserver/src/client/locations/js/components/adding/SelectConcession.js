import { locationsPage } from '../../../../common/js/config';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';
import React, { Component } from 'react';

export default class SelectConcession extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // substate: '',
      // state: '',
      // country: '',
      concessionType: '',
      concessionSearch: '',
      loggingConcession: '',
      miningConcession: '',
      palmOilConcession: '',
      woodFiberConcession: '',
      filterStr: '',
      loggingOptions: [],
      miningOptions: [],
      palmOilOptions: [],
      woodFiberOptions: [],
    };
  }

  componentDidMount() {
    const loggingQT = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer/3');
    const miningQT = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer/2');
    const palmOilQT = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer/1');
    const woodFiberQT = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer/0');

    const query = new Query();
    query.returnGeometry = false;
    query.outFields = ['name'];
    query.where = '1=1';
    // query.orderByFields = 'name';
    query.returnDistinctValues = true;

    loggingQT.execute(query).then(this.assignLogging);
    miningQT.execute(query).then(this.assignMining);
    palmOilQT.execute(query).then(this.assignPalmOil);
    woodFiberQT.execute(query).then(this.assignWoodFiber);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.concessionType !== prevState.concessionType) {
      if (this.state.concessionType === 'Logging Concession' && this.state.loggingConcession) {
        this.queryConcessions('logging');
      } else if (this.state.concessionType === 'Mining Concession' && this.state.miningConcession) {
        this.queryConcessions('mining');
      } else if (this.state.concessionType === 'Palm Oil Concession' && this.state.palmOilConcession) {
        this.queryConcessions('palmOil');
      } else if (this.state.concessionType === 'Wood Fiber Concession' && this.state.woodFiberConcession) {
        this.queryConcessions('woodFiber');
      }
    } else if (this.state.loggingConcession !== prevState.loggingConcession) {
      this.queryConcessions('logging');
    } else if (this.state.miningConcession !== prevState.miningConcession) {
      this.queryConcessions('mining');
    } else if (this.state.palmOilConcession !== prevState.palmOilConcession) {
      this.queryConcessions('palmOil');
    } else if (this.state.woodFiberConcession !== prevState.woodFiberConcession) {
      this.queryConcessions('woodFiber');
    }
  }

  queryConcessions = (concessionType) => {
    let url = 'https://gis-gfw.wri.org/arcgis/rest/services/land_use/MapServer/';
    let name;
    if (concessionType === 'logging') {
      url += '3';
      name = this.state.loggingConcession;
    } else if (concessionType === 'mining') {
      url += '2';
      name = this.state.miningConcession;
    } else if (concessionType === 'palmOil') {
      url += '1';
      name = this.state.palmOilConcession;
    } else if (concessionType === 'woodFiber') {
      url += '0';
      name = this.state.woodFiberConcession;
    }
    const loggingQT = new QueryTask(url);

    const query = new Query();
    query.returnGeometry = true;
    query.geometryPrecision = 1000;
    query.outFields = [];
    query.where = "name = '" + name + "'";

    loggingQT.execute(query).then(this.deduceAdmin);
  };

  deduceAdmin = (result) => {
    if (result.features && result.features.length > 0) {
      this.props.setGeometry(result.features[0].geometry);
    }
  };

  assignLogging = (res) => {
    const loggingFeats = [];
    res.features.forEach((feature) => {
      loggingFeats.push(feature.attributes.name);
    });
    loggingFeats.sort();
    this.setState({ loggingOptions: loggingFeats });
  };

  assignMining = (res) => {
    const miningFeats = [];
    res.features.forEach((feature) => {
      miningFeats.push(feature.attributes.name);
    });
    this.setState({ miningOptions: miningFeats });
  };

  assignPalmOil = (res) => {
    const palmOilFeats = [];
    res.features.forEach((feature) => {
      palmOilFeats.push(feature.attributes.name);
    });
    this.setState({ palmOilOptions: palmOilFeats });
  };

  assignWoodFiber = (res) => {
    const woodFiberFeats = [];
    res.features.forEach((feature) => {
      woodFiberFeats.push(feature.attributes.name);
    });
    this.setState({ woodFiberOptions: woodFiberFeats });
  };

  setType = (evt) => {
    this.setState({ concessionType: evt.target.value });
  };

  createConcession = (concession, j) => {
    return (
      <option key={j} id={concession.id}>
        {concession.name}
      </option>
    );
  };

  selectLogging = (evt) => {
    this.setState({ loggingConcession: evt.target.value });
    this.props.setName(evt);
  };

  selectMining = (evt) => {
    this.setState({ miningConcession: evt.target.value });
    this.props.setName(evt);
  };

  selectPalmOil = (evt) => {
    this.setState({ palmOilConcession: evt.target.value });
    this.props.setName(evt);
  };

  selectWoodFiber = (evt) => {
    this.setState({ woodFiberConcession: evt.target.value });
    this.props.setName(evt);
  };

  createLogging = (loggingOption, j) => {
    if (loggingOption.toLowerCase().includes(this.state.concessionSearch.toLowerCase())) {
      return <option key={j}>{loggingOption}</option>;
    }
  };

  createMining = (miningOption, j) => {
    if (miningOption.toLowerCase().includes(this.state.concessionSearch.toLowerCase())) {
      return <option key={j}>{miningOption}</option>;
    }
  };

  createPalmOil = (palmOilOption, j) => {
    if (palmOilOption.toLowerCase().includes(this.state.concessionSearch.toLowerCase())) {
      return <option key={j}>{palmOilOption}</option>;
    }
  };

  createWoodFiber = (woodFiberOption, j) => {
    if (woodFiberOption.toLowerCase().includes(this.state.concessionSearch.toLowerCase())) {
      return <option key={j}>{woodFiberOption}</option>;
    }
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

  updateConcession = (evt) => {
    this.setState({ concessionSearch: evt.target.value });
  };

  createOptions = (option, j) => {
    return <option key={j}>{option}</option>;
  };

  filterOptions = (evt) => {
    this.setState({ filterStr: evt.target.value });
  };

  setOption = (evt) => {
    switch (this.state.concessionType) {
      case 'Logging Concession':
        this.setState({ loggingConcession: evt.target.value });
        break;
      case 'Mining Concession':
        this.setState({ miningConcession: evt.target.value });
        break;
      case 'Palm Oil Concession':
        this.setState({ palmOilConcession: evt.target.value });
        break;
      case 'Wood Fiber Concession':
        this.setState({ woodFiberConcession: evt.target.value });
        break;
      default:
    }
    this.props.setName(evt);
  };

  render() {
    const countryOption = this.createCountry();
    const stateOption = this.createState();
    const subStateOption = this.createSubState();

    const concessionTypesShown =
      this.props.addType !== 'commodity'
        ? locationsPage.add.concessionTypes
        : locationsPage.add.concessionTypes.filter((type) => type.id === 'palmOil');

    let commodityOptions = [];
    let activeCommodity;

    switch (this.state.concessionType) {
      case 'Logging Concession':
        commodityOptions = this.state.loggingOptions.filter((option) => {
          return option.toLowerCase().includes(this.state.filterStr.toLowerCase());
        });
        activeCommodity = this.state.loggingConcession;
        break;
      case 'Mining Concession':
        commodityOptions = this.state.miningOptions.filter((option) => {
          return option.toLowerCase().includes(this.state.filterStr.toLowerCase());
        });
        activeCommodity = this.state.miningConcession;
        break;
      case 'Palm Oil Concession':
        commodityOptions = this.state.palmOilOptions.filter((option) => {
          return option.toLowerCase().includes(this.state.filterStr.toLowerCase());
        });
        activeCommodity = this.state.palmOilConcession;
        break;
      case 'Wood Fiber Concession':
        commodityOptions = this.state.woodFiberOptions.filter((option) => {
          return option.toLowerCase().includes(this.state.filterStr.toLowerCase());
        });
        activeCommodity = this.state.woodFiberConcession;
        break;
      default:
    }

    return (
      <div className={`locations-add-subpage ${this.props.addMethod === 'byConcession' ? '' : 'hidden'}`}>
        <div className="locations-add-subpage__content">
          <div className="concession-area__concession-type-dropdown">
            <h3>Select Concession Type</h3>
          </div>

          <select
            onChange={this.setType}
            className="locations-subpage-select"
            value={this.state.concessionType ? this.state.concessionType : 'Select Concession Type'}
          >
            <option disabled> Concession Type</option>
            {concessionTypesShown.map(this.createConcession)}
          </select>

          <input
            className={`locations-subpage-search ${this.state.concessionType ? '' : 'hidden'}`}
            onChange={this.filterOptions}
            placeholder="Search..."
          />

          <select
            value={activeCommodity}
            onChange={this.setOption}
            className={`locations-subpage-select-custom half-width ${this.state.concessionType ? '' : 'hidden'}`}
            size="10"
          >
            {commodityOptions.map(this.createOptions)}
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
