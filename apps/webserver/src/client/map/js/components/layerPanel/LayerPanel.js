// import MapComponent from '../../../../map/js/components/MapComponent';
// import '../../../../map/css/map.scss';
import store from '../../store';
import { toggleLayer, showLists } from '../../actions/mapActions';
import AppBar from 'material-ui/AppBar';
import LayerCheckbox from './LayerCheckbox';
import React, { Component } from 'react';
import { proLayers } from '../../../../common/js/config';

import '../../../css/map.scss';

export default class LayerPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleMenu: '',
      filterStr: '',
    };
  }

  hideGroup = () => {
    this.setState({ visibleMenu: '' });
  };

  showGroup = (evt) => {
    // console.log('showGroup', evt.target.id);
    // console.log('showGroup', evt.target);

    let current = '';
    let currentSpace = evt.target.id;
    if (!currentSpace) {
      currentSpace = evt.target.parentElement.id;
    }
    switch (currentSpace) {
      case 'forestChangeHeader':
        current = 'forestChange';
        break;
      case 'landCoverHeader':
        current = 'landCover';
        break;
      case 'landUseHeader':
        current = 'landUse';
        break;
      case 'conservationHeader':
        current = 'conservation';
        break;
      case 'peopleHeader':
        current = 'people';
        break;
      case 'regionHeader':
        current = 'regionCountry';
        break;
      default:
        break;
    }
    // console.log('current', current);
    if (current) {
      this.setState({ visibleMenu: current });
    }
  };

  toggleLayer = (evt) => {
    const layerId = evt.target.id.split('-layer-checkbox')[0];
    store.dispatch(toggleLayer(layerId));
  };

  createLayerElement = (layer, i) => {
    return (
      <LayerCheckbox
        key={`${i} + ${layer.id}`}
        layer={layer}
        visibleLayers={this.props.visibleLayers}
        iconLoading={this.props.iconLoading}
      />
    );
  };

  createCategoryLayerElement = (layer, i, array) => {
    if (array.findIndex((searchLayer) => searchLayer.subGroup === layer.subGroup) === i) {
      return (
        <div key={`parent-${i} + ${layer.id}`}>
          <div
            className={`layer-checkbox-title ${
              layer.order === 300 || layer.order === 100 ? 'layer-checkbox-title-first' : ''
            }`}
          >
            {layer.subGroup.split('-').join(' ')}
          </div>
          <LayerCheckbox
            key={`${i} + ${layer.id}`}
            layer={layer}
            visibleLayers={this.props.visibleLayers}
            iconLoading={this.props.iconLoading}
          />
        </div>
      );
    } else {
      return (
        <LayerCheckbox
          key={`${i} + ${layer.id}`}
          layer={layer}
          visibleLayers={this.props.visibleLayers}
          iconLoading={this.props.iconLoading}
        />
      );
    }
  };

  createRegionLayerElement = (layer, i, array) => {
    if (array.findIndex((searchLayer) => searchLayer.region === layer.region) === i) {
      return (
        <div key={`region-${i} + ${layer.id}`}>
          <div
            key={`region-div-${i} + ${layer.id}`}
            className={`layer-checkbox-region ${layer.region === 'other' ? 'region-other' : ''}`}
          >
            {layer.region.replace('-', ' ')}
          </div>
          {layer.region !== 'other' && layer.country !== 'Southeast Asia' ? (
            <div key={`country-${i} + ${layer.id}`} className="layer-checkbox-country">
              {layer.country}
            </div>
          ) : null}
          <LayerCheckbox
            key={`${i} + ${layer.id}`}
            layer={layer}
            visibleLayers={this.props.visibleLayers}
            iconLoading={this.props.iconLoading}
          />
        </div>
      );
    } else if (
      layer.region !== 'other' &&
      array.findIndex((searchLayer) => searchLayer.country === layer.country) === i
    ) {
      return (
        <div key={`region-${i} + ${layer.id}`}>
          <div key={`region-div-${i} + ${layer.id}`} className="layer-checkbox-country">
            {layer.country}
          </div>
          <LayerCheckbox
            key={`${i} + ${layer.id}`}
            layer={layer}
            visibleLayers={this.props.visibleLayers}
            iconLoading={this.props.iconLoading}
          />
        </div>
      );
    } else {
      return (
        <LayerCheckbox
          key={`${i} + ${layer.id}`}
          layer={layer}
          visibleLayers={this.props.visibleLayers}
          iconLoading={this.props.iconLoading}
        />
      );
    }
  };

  searchCountries = (evt) => {
    this.setState({ filterStr: evt.target.value });
  };

  render() {
    // hide geographic coverage layers from map dropdown options so they only appear when turning on the legend toggle
    const forestChangeLayers = this.props.mapLayers.filter(
      (layer) =>
        layer.group === 'forest-change' &&
        layer.id !== proLayers.raddCoverageID &&
        layer.id !== proLayers.umdGladLandsatAlertsCoverageID
    );
    const landCoverLayers = this.props.mapLayers.filter(
      (layer) =>
        layer.group === 'land-cover' && layer.id !== proLayers.clarkLabsAquacultureLandChange
    );
    const landUseLayers = this.props.mapLayers.filter(
      (layer) => layer.group === 'land-use' && layer.id !== proLayers.soyOnTreeCoverLoss
    );
    const conservationLayers = this.props.mapLayers.filter(
      (layer) => layer.group === 'conservation'
    );
    const peopleLayers = this.props.mapLayers.filter((layer) => layer.group === 'people');
    const regionLayers = this.props.mapLayers.filter((layer) => layer.group === 'region');
    const filteredRegionLayers = regionLayers.filter(
      (e) => e.country.toLowerCase().includes(this.state.filterStr.toLowerCase()) || ''
    );
    return (
      <AppBar className="map__header" showMenuIconButton={false}>
        <nav className="map-navigation__container">
          <div className="map__headers-list" id="layer-panel-nav">
            <div className="nav-item__container forest-change-nav__container">
              <div
                onMouseEnter={this.showGroup}
                id="forestChangeHeader"
                className="map__nav__item forest-change-list-header"
              >
                Forest Change
              </div>
              <div
                onMouseLeave={this.hideGroup}
                className={`map__layer-list-dropdown forest-change-menu ${
                  this.state.visibleMenu === 'forestChange' ? '' : 'hidden'
                }`}
              >
                <div className="drop-down__title-container">
                  <div className="drop-down__title-icon" />
                  <div className="drop-down__title-label">Forest Change</div>
                </div>
                <div className="map__headers-list-scroll">
                  {forestChangeLayers.map(this.createCategoryLayerElement)}
                </div>
              </div>
            </div>
            <div className="nav-item__container land-cover-nav__container">
              <div
                onMouseEnter={this.showGroup}
                id="landCoverHeader"
                className="map__nav__item land-cover-list-header"
              >
                Land Cover
              </div>
              <div
                onMouseLeave={this.hideGroup}
                className={`map__layer-list-dropdown land-cover-menu ${
                  this.state.visibleMenu === 'landCover' ? '' : 'hidden'
                }`}
              >
                <div className="drop-down__title-container">
                  <div className="drop-down__title-icon" />
                  <div className="drop-down__title-label">Land Cover</div>
                </div>
                <div className="map__headers-list-scroll">
                  {landCoverLayers.map(this.createLayerElement)}
                </div>
              </div>
            </div>
            <div className="nav-item__container land-use-nav__container">
              <div
                onMouseEnter={this.showGroup}
                id="landUseHeader"
                className="map__nav__item land-use-list-header"
              >
                Land Use
              </div>
              <div
                onMouseLeave={this.hideGroup}
                className={`map__layer-list-dropdown land-use-menu ${
                  this.state.visibleMenu === 'landUse' ? '' : 'hidden'
                }`}
              >
                <div className="drop-down__title-container">
                  <div className="drop-down__title-icon" />
                  <div className="drop-down__title-label">Land Use</div>
                </div>
                <div className="map__headers-list-scroll">
                  {landUseLayers.map(this.createCategoryLayerElement)}
                </div>
              </div>
            </div>
            <div className="nav-item__container conservation-nav__container">
              <div
                onMouseEnter={this.showGroup}
                id="conservationHeader"
                className="map__nav__item conservation-list-header"
              >
                Conservation
              </div>
              <div
                onMouseLeave={this.hideGroup}
                className={`map__layer-list-dropdown conservation-menu ${
                  this.state.visibleMenu === 'conservation' ? '' : 'hidden'
                }`}
              >
                <div className="drop-down__title-container">
                  <div className="drop-down__title-icon" />
                  <div className="drop-down__title-label">Conservation</div>
                </div>
                <div className="map__headers-list-scroll">
                  {conservationLayers.map(this.createLayerElement)}
                </div>
              </div>
            </div>
            <div className="nav-item__container people-nav__container">
              <div
                onMouseEnter={this.showGroup}
                id="peopleHeader"
                className="map__nav__item people-list-header"
              >
                People
              </div>
              <div
                onMouseLeave={this.hideGroup}
                className={`map__layer-list-dropdown people-menu ${
                  this.state.visibleMenu === 'people' ? '' : 'hidden'
                }`}
              >
                <div className="drop-down__title-container">
                  <div className="drop-down__title-icon" />
                  <div className="drop-down__title-label">People</div>
                </div>
                <div className="map__headers-list-scroll">
                  {peopleLayers.map(this.createLayerElement)}
                </div>
              </div>
            </div>
            <div className="nav-item__container country-data-nav__container">
              <div
                onMouseEnter={this.showGroup}
                id="regionHeader"
                className="map__nav__item region-list-header"
              >
                Region and Country Data
              </div>
              <div
                onMouseLeave={this.hideGroup}
                className={`map__layer-list-dropdown region-menu ${
                  this.state.visibleMenu === 'regionCountry' ? '' : 'hidden'
                }`}
              >
                <div className="drop-down__title-container">
                  <div className="drop-down__title-icon" />
                  <div className="drop-down__title-label">Region and Country Data</div>
                </div>
                <div className="map__headers-list-scroll">
                  <div className="region-countries-search-container">
                    <svg className="svg-icon">
                      <use xlinkHref="#icon-control-search" />
                    </svg>
                    <input className="region-countries-search" onChange={this.searchCountries} />
                  </div>
                  {filteredRegionLayers.map(this.createRegionLayerElement)}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </AppBar>
    );
  }
}
