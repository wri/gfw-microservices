import React, { Component } from 'react';
import store from '../../store';
import _range from 'lodash/range';
import {
  toggleLayer,
  showLoading,
  getLayerInfo,
  showBasemapInfo,
  toggleCanopyModal,
  updateGFWLocations,
  removeList,
  updateSoyYear,
} from '../../actions/mapActions';
import { setBiomassMinRange, setBiomassMaxRange } from '../../actions/analysisActions';
import utils from '../../utils/AppUtils';
import { proLayers, mapPage, soyPlantedYearsRange } from '../../../../common/js/config';
const {
  viirsActiveFiresID,
  aboveGroundBiomassId,
  soyInCerradoBiome,
  treeBiomassLossID,
  soyOnTreeCoverLoss,
  gladAlertsID,
  soyPlantedArea,
  raddAlertsID,
  raddCoverageID,
  clarkLabsAquacultureLandCover,
  clarkLabsAquacultureLandChange,
} = proLayers;
import GfwSelect from '../../../../common/js/components/GfwSelect';

import '../../../css/map.scss';
import RaddLayerLegend from './RaddLayerLegend';
import { toggleClarkLabsLayers, toggleRaddLayers } from '../../actions/analysisActions';
import ClarkLabsLayerLeyend from './ClarkLabsLayerLeyend';
import GladLayerLegend from './GladLayerLegend';

export default class LegendCheckbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layerHidden: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.visibleLayers.indexOf(this.props.layer.id) > -1 &&
      this.props.visibleLayers.indexOf(this.props.layer.id) === -1 &&
      this.state.layerHidden === true &&
      this.props.layer.id !== raddAlertsID
    ) {
      this.hardShow();
    }
  }

  hardShow = () => {
    this.setState({
      layerHidden: false,
    });
  };

  clearGFWFilter = () => {
    store.dispatch(updateGFWLocations({}));
  };

  showInfo = () => {
    store.dispatch(showLoading(this.props.layer.id));
    store.dispatch(getLayerInfo(this.props.layer));
  };

  updateBiomassMin = (evt) => {
    store.dispatch(setBiomassMinRange(evt.target.value));
  };

  updateBiomassMax = (evt) => {
    store.dispatch(setBiomassMaxRange(evt.target.value));
  };

  hideLayer = () => {
    if (this.props.layer.id === soyInCerradoBiome) {
      store.dispatch(toggleLayer(soyOnTreeCoverLoss));
    }

    const { visibleLayers } = store.getState();
    if (this.props.layer.id === raddAlertsID) {
      store.dispatch(toggleRaddLayers());
      if (visibleLayers.includes(raddAlertsID)) {
        store.dispatch(toggleLayer(raddAlertsID));
      }
      if (visibleLayers.includes(raddCoverageID)) {
        store.dispatch(toggleLayer(raddCoverageID));
      }
    } else if (this.props.layer.id === clarkLabsAquacultureLandCover) {
      store.dispatch(toggleClarkLabsLayers());
      if (visibleLayers.includes(clarkLabsAquacultureLandCover)) {
        store.dispatch(toggleLayer(clarkLabsAquacultureLandCover));
      }
      if (visibleLayers.includes(clarkLabsAquacultureLandChange)) {
        store.dispatch(toggleLayer(clarkLabsAquacultureLandChange));
      }
    } else {
      store.dispatch(toggleLayer(this.props.layer.id));
    }

    const [selectedList] = this.props.selectedLists;
    const hasSelectedList = !!selectedList;

    if (hasSelectedList) {
      // can be hardcoded to 0 because there will only ever
      // be one list selected at a time
      store.dispatch(removeList(0));
    }

    if (this.props.gfwListDef.hasOwnProperty(this.props.layer.id)) {
      this.clearGFWFilter();
    }
  };

  toggleCanopyModal = () => {
    store.dispatch(toggleCanopyModal());
  };

  toggleLayerVisibility = async () => {
    if (this.props.layer.id === raddAlertsID) {
      if (this.props.visibleLayers.includes(raddAlertsID)) {
        await store.dispatch(toggleLayer(raddAlertsID));
      }
      if (this.props.visibleLayers.includes(raddCoverageID)) {
        await store.dispatch(toggleLayer(raddCoverageID));
      }
    } else if (this.props.layer.id === clarkLabsAquacultureLandCover) {
      if (this.props.visibleLayers.includes(clarkLabsAquacultureLandCover)) {
        await store.dispatch(toggleLayer(clarkLabsAquacultureLandCover));
      }
      if (this.props.visibleLayers.includes(clarkLabsAquacultureLandChange)) {
        await store.dispatch(toggleLayer(clarkLabsAquacultureLandChange));
      }
    } else {
      this.props.toggleLayerVisibility(this.props.layer.id);
    }

    this.setState({
      layerHidden: !this.state.layerHidden,
    });
  };

  layerLegendMap = (symbol, i) => {
    const symbolStyle = {
      background: symbol.color,
    };
    return (
      <li key={`${i}${symbol.name}`}>
        <span className="layer-legend-symbol" style={symbolStyle}></span>
        <span className="layer-legend-label">{symbol.name}</span>
      </li>
    );
  };

  displayWarning = () => {
    const layerWarning = utils.getObject(mapPage.layerWarnings, 'id', this.props.layer.id);
    store.dispatch(showBasemapInfo(layerWarning.content));
  };

  soyPlantedYearPicker = (layer) => {
    const { soyYear } = store.getState();
    const years = _range(soyPlantedYearsRange[0], soyPlantedYearsRange[1] + 1);
    return (
      <React.Fragment>
        <ul className="layer-legend">{layer.legendConfig.items.map(this.layerLegendMap)}</ul>
        <div className="soy-year-picker">
          <p className="layer-legend-message">{'Displaying Soy planted area in'}</p>
          <div className="landsat-dropdown-root">
            <GfwSelect
              options={years}
              value={soyYear}
              onChange={(evt) => {
                store.dispatch(updateSoyYear(evt.value));
              }}
            />
          </div>
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { layer, visibleLayers, iconLoading, gfwListDef } = this.props;
    const label = layer.legendConfig.items[0].name;
    const grayed = this.state.layerHidden ? 'grayed' : '';
    const symbolsLength = layer.legendConfig.items ? layer.legendConfig.items.length : 0;
    const categoriesLength =
      symbolsLength === 1 && layer.legendConfig.items[0].categories
        ? layer.legendConfig.items[0].categories.length
        : 0;
    const layerWarning = utils.getObject(mapPage.layerWarnings, 'id', layer.id);

    const symbolStyle = {
      fill: 'green',
    };

    if (symbolsLength === 1) {
      symbolStyle.fill = layer.legendConfig.items[0].color;
    }

    let hidden;

    if (layer.id === raddAlertsID) {
      hidden = store.getState().raddLayers ? '' : 'hidden';
    } else if (layer.id === clarkLabsAquacultureLandCover) {
      hidden = store.getState().clarkLabsLayers ? '' : 'hidden';
    } else {
      hidden = visibleLayers.indexOf(layer.id) === -1 ? 'hidden' : '';
    }
    return (
      <div
        className={`legend-list-item ${layer.group} ${grayed} ${hidden}`}
        id={layer.id + '-layer-checkbox'}
      >
        <span
          onClick={this.toggleLayerVisibility}
          className={`info-icon icon-eye pointer ${grayed} ${
            iconLoading === layer.id ? 'iconLoading' : ''
          }`}
        >
          {grayed === 'grayed' ? (
            <svg>
              <use xlinkHref="#icon-hide-layer-map" />
            </svg>
          ) : (
            <svg style={symbolStyle}>
              <use xlinkHref="#icon-show-layer-map" />
            </svg>
          )}
        </span>

        <span className="layer-checkbox-label">{label}</span>
        {gfwListDef &&
        Object.keys(gfwListDef).length > 0 &&
        Object.keys(gfwListDef)[0] === layer.id ? (
          <span className="info-icon gfw-filter pointer" onClick={this.clearGFWFilter}>
            <svg>
              <use xlinkHref="#shape-close" />
            </svg>
          </span>
        ) : null}
        <span
          className={`info-icon metadata-legend pointer ${
            iconLoading === layer.id ? 'iconLoading' : ''
          }`}
          onClick={this.showInfo}
        >
          <svg>
            <use xlinkHref="#shape-info" />
          </svg>
        </span>
        {layer.id !== soyOnTreeCoverLoss ? (
          <span className="info-icon pointer" onClick={this.hideLayer}>
            <svg>
              <use xlinkHref="#shape-close" />
            </svg>
          </span>
        ) : null}
        {layer.id === soyOnTreeCoverLoss ? (
          <p className="layer-legend-message">
            {mapPage.densityLossStart}
            <span
              onClick={this.toggleCanopyModal}
              className="layer-legend-loss-display"
            >{`>${this.props.canopyDensity}%`}</span>
            {mapPage.densityLossEnd}
          </p>
        ) : null}
        {layer.id === soyPlantedArea ? this.soyPlantedYearPicker(layer) : null}

        {symbolsLength > 1 && layer.id !== soyPlantedArea ? (
          <ul className="layer-legend">{layer.legendConfig.items.map(this.layerLegendMap)}</ul>
        ) : null}

        {store.getState().raddLayers && layer.id === raddAlertsID ? (
          <RaddLayerLegend disabled={grayed} layer={layer} />
        ) : null}

        {store.getState().clarkLabsLayers && layer.id === clarkLabsAquacultureLandCover ? (
          <ClarkLabsLayerLeyend
            disabled={grayed}
            landCoverLayer={layer}
            landChangeLayer={this.props.mapLayers.find(
              (layer) => layer.id === clarkLabsAquacultureLandChange
            )}
          />
        ) : null}

        {symbolsLength === 1 &&
        categoriesLength > 0 &&
        layer.id === gladAlertsID &&
        layer.id !== soyPlantedArea ? (
          <GladLayerLegend
            disabled={grayed}
            layer={layer}
            gladConfirmed={this.props.gladConfirmed}
          />
        ) : null}

        {symbolsLength === 1 &&
        categoriesLength > 0 &&
        layer.id !== gladAlertsID &&
        layer.id !== raddAlertsID &&
        layer.id !== clarkLabsAquacultureLandCover &&
        layer.id !== soyPlantedArea ? (
          <ul className="layer-legend">
            {layer.legendConfig.items[0].categories.map(this.layerLegendMap)}
          </ul>
        ) : null}

        {layer.id === aboveGroundBiomassId ? (
          <p className="layer-legend-message">
            {mapPage.groundBiomassStart}
            <span
              onClick={this.toggleCanopyModal}
              className="layer-legend-loss-display"
            >{`>${this.props.canopyDensity}%`}</span>
            {mapPage.densityLossEnd}
          </p>
        ) : null}
        {mapPage.densityDisplayLayers.indexOf(layer.id) > -1 ? (
          <p className="layer-legend-message">
            {mapPage.densityLossStart}
            <span
              onClick={this.toggleCanopyModal}
              className="layer-legend-loss-display"
            >{`>${this.props.canopyDensity}%`}</span>
            {mapPage.densityLossEnd}
          </p>
        ) : null}
        {layer.id === treeBiomassLossID ? (
          <div className="layer-details carbon-stocks">
            <ul className="carbon-labels">
              <li>0</li>
              <li>
                917
                <span className="units">
                  {' '}
                  t CO2 ha <sup>-1</sup>
                </span>
              </li>
            </ul>
            <div className="quartile-tree-biomass-loss"></div>
            <p className="canopy-range">Show values between</p>
            <span className="canopy-range-wrapper">
              <span className="canopy-range-button">
                <input
                  type="number"
                  step="1"
                  onChange={this.updateBiomassMin}
                  value={this.props.biomassRange.min}
                />
              </span>
              to
              <span className="canopy-range-button">
                <input
                  type="number"
                  step="1"
                  onChange={this.updateBiomassMax}
                  value={this.props.biomassRange.max}
                />
              </span>
            </span>
          </div>
        ) : null}
        {layer.id === aboveGroundBiomassId ? (
          <div className="layer-details carbon-stocks">
            <ul className="carbon-labels">
              <li>0</li>
              <li>
                500
                <span className="units">
                  {' '}
                  Mg Ha <sup>-1</sup>
                </span>
              </li>
            </ul>
            <div className="quartile-biomass-loss"></div>
            <p className="canopy">For more information about this layer</p>
            <p className="canopy">
              <a href="http://climate.globalforestwatch.org/" target="_blank">
                Check out GFW Climate ➤
              </a>
            </p>
          </div>
        ) : null}
        {layerWarning ? (
          <p className="layer-legend-message">
            {layerWarning.title}
            <span onClick={this.displayWarning} className="layer-legend-warning-source">
              ?
            </span>
          </p>
        ) : null}
        {layer.id === viirsActiveFiresID ? (
          <p className="layer-legend-message">
            For more infromation about this layer{' '}
            <a
              href="http://fires.globalforestwatch.org/home/"
              target="_blank"
              className="layer-legend-link link-viirs"
            >
              Check out GFW Fires
              <svg>
                <use xlinkHref="#icon-navigate" />
              </svg>
            </a>
          </p>
        ) : null}
      </div>
    );
  }
}
