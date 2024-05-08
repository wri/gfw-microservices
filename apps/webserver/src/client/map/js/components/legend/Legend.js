import store from '../../store';
import { toggleLayer } from '../../actions/mapActions';
import LegendCheckbox from './LegendCheckbox';
import RegionLegend from './RegionLegend';
import '../../../css/map.scss';
import React, { Component } from 'react';
import LegendSection from './LegendSection';
import { proLayers } from '../../../../common/js/proLayers.config';

export default class Legend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minimizedGroups: [],
      showPanel: true,
    };
  }

  hideGroup = (evt) => {
    if (evt.target.parentElement.id === 'layer-panel-nav') {
      // TODO: What is happening here??
    } else {
      this.setState({ visibleMenu: '' });
    }
  };

  toggleLayer = (evt) => {
    const layerId = evt.target.id.split('-layer-checkbox')[0];
    store.dispatch(toggleLayer(layerId));
  };

  isVisible = (layers) => {
    let visible = false;
    layers.forEach((layer) => {
      if (this.props.visibleLayers.indexOf(layer.id) > -1) {
        visible = true;
      }
    });
    return visible;
  };

  createLayerLegend = (layer, i) => (
    <LegendCheckbox
      biomassRange={this.props.biomassRange}
      canopyDensity={this.props.canopyDensity}
      key={i}
      layer={layer}
      visibleLayers={this.props.visibleLayers}
      iconLoading={this.props.iconLoading}
      toggleLayerVisibility={this.props.toggleLayerVisibility}
      gfwListDef={this.props.gfwListDef}
      selectedLists={this.props.selectedLists}
      mapLayers={this.props.mapLayers}
    />
  );

  togglePanel = () => {
    this.setState({ showPanel: !this.state.showPanel });
  };

  render() {
    const { clarkLabsAquacultureLandChange } = proLayers;
    const { showPanel } = this.state;

    const forestChangeLayers = this.props.mapLayers.filter(
      (layer) => layer.group === 'forest-change'
    );
    const landCoverLayers = this.props.mapLayers.filter(
      (layer) => layer.group === 'land-cover' && layer.id !== clarkLabsAquacultureLandChange
    );
    const landUseLayers = this.props.mapLayers.filter((layer) => layer.group === 'land-use');
    const conservationLayers = this.props.mapLayers.filter(
      (layer) => layer.group === 'conservation'
    );
    const peopleLayers = this.props.mapLayers.filter((layer) => layer.group === 'people');
    const regionLayers = this.props.mapLayers.filter((layer) => layer.group === 'region');

    const visibleForestChange = this.isVisible(forestChangeLayers);
    const visibleLandCover = this.isVisible(landCoverLayers) || store.getState().clarkLabsLayers;
    const visibleLandUse = this.isVisible(landUseLayers);
    const visibleConservation = this.isVisible(conservationLayers);
    const visiblePeople = this.isVisible(peopleLayers);
    const visibleRegion = this.isVisible(regionLayers);
    const visibleGlobalData =
      visibleForestChange ||
      visibleLandCover ||
      visibleLandUse ||
      visibleConservation ||
      visiblePeople ||
      visibleRegion;

    return (
      <div
        className={`map__legend ${
          !visibleGlobalData || this.props.panelsVisible === false ? 'hidden' : ''
        }`}
      >
        <ul className="map__legend__list">
          <li className="map__layer-list__item">
            <RegionLegend
              regionLayers={regionLayers}
              visibleRegion={visibleRegion}
              canopyDensity={this.props.canopyDensity}
              visibleLayers={this.props.visibleLayers}
              iconLoading={this.props.iconLoading}
              toggleLayerVisibility={this.props.toggleLayerVisibility}
            />
            <div
              className={`legend-checkbox-global legend-show-panel ${
                visibleGlobalData ? '' : 'hidden'
              }`}
              onClick={this.togglePanel}
            >
              global data
              <svg className={showPanel ? '' : 'close'}>
                <use xlinkHref="#icon-triangle" />
              </svg>
            </div>
            <div className={showPanel ? '' : 'hidden'}>
              <LegendSection
                key="legend-section-1"
                visible={visibleForestChange}
                layers={forestChangeLayers}
                sectionHeader="forest-change"
                text="Forest Change"
                createLayerLegend={this.createLayerLegend}
              />
              <LegendSection
                key="legend-section-2"
                visible={visibleLandCover}
                layers={landCoverLayers}
                sectionHeader="land-cover"
                text="Land Cover"
                createLayerLegend={this.createLayerLegend}
              />
              <LegendSection
                key="legend-section-3"
                visible={visibleLandUse}
                layers={landUseLayers}
                sectionHeader="land-use"
                text="Land Use"
                createLayerLegend={this.createLayerLegend}
              />
              <LegendSection
                key="legend-section-4"
                visible={visibleConservation}
                layers={conservationLayers}
                sectionHeader="conservation"
                text="Conservation"
                createLayerLegend={this.createLayerLegend}
              />
              <LegendSection
                key="legend-section-5"
                visible={visiblePeople}
                layers={peopleLayers}
                sectionHeader="people"
                text="People"
                createLayerLegend={this.createLayerLegend}
              />
            </div>
          </li>
        </ul>
      </div>
    );
  }
}
