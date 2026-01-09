import { Component } from 'react';
import store from '../../store';
import _range from 'lodash/range';
import { Box, Typography } from '@mui/material';
import { HelperTextWithPopover, Switch } from '../../../../components';
import {
  toggleLayer,
  turnLayerOff,
  toggleHighConfidenceAlertsForDeforestationAlertsLayers,
  showLoading,
  getLayerInfo,
  showBasemapInfo,
  toggleCanopyModal,
  toggleTreeCoverLossCanopyModal,
  updateGFWLocations,
  updateSoyYear,
  updateTreeCoverLossCanopyDensity,
  setLayerOpacity,
} from '../../actions/mapActions';
import { setBiomassMinRange, setBiomassMaxRange } from '../../actions/analysisActions';
import { mapPage, soyPlantedYearsRange } from '../../../../common/js/config';
import {
  proLayers,
  densityDisplayLayers,
  layerWarnings,
  DEFAULT_TREE_COVER_LOSS_CANOPY_DENSITY,
} from '../../../../common/js/proLayers.config';

const {
  viirsActiveFiresID,
  aboveGroundBiomassId,
  treeBiomassLossID,
  treeCoverLossID,
  soyPlantedArea,
  clarkLabsAquacultureLandCover,
  clarkLabsAquacultureLandChange,
  disturbanceAlertsDriversId,
  disturbanceAlertsDriversGeographicCoverageId,
  globalVegetationDisturbanceAlertsId,
  globalIntegratedDisturbanceAlertsId,
} = proLayers;
import GfwSelect from '../../../../common/js/components/GfwSelect';
import OpacitySlider from './OpacitySlider';
import '../../../css/map.scss';
import DeforestationAlertsLayerLegend from './DeforestationAlerts/DeforestationAlertsLayerLegend';
import { DriverOfDisturbanceAlertsLayerLegend } from './custom/DriverOfDisturbanceAlertsLayerLegend';
import { toggleClarkLabsLayers } from '../../actions/analysisActions';
import ClarkLabsLayerLeyend from './ClarkLabsLayerLeyend';
import {
  deforestationAlertsIds,
  deforestationAlertsGeographicCoverageIds,
  deforestationAlertsLayerToCoverageMap,
} from './DeforestationAlerts/deforestationAlerts.constants';
import './LegendCheckbox.scss';
import { GlobalVegetationDisturbanceAlertsLayerLegend } from './custom/GlobalVegetationDisturbanceAlertsLayerLegend';
import { GlobalIntegratedDisturbanceAlertsLayerLegend } from './custom/GlobalIntegratedDisturbanceAlertsLayerLegend';

export default class LegendCheckbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layerHidden: false,
      layerOpacity: store.getState().layerOpacity || {},
    };
  }

  componentDidMount() {
    // Subscribe to store changes to update opacity
    this.unsubscribe = store.subscribe(() => {
      const newLayerOpacity = store.getState().layerOpacity || {};
      if (newLayerOpacity !== this.state.layerOpacity) {
        this.setState({ layerOpacity: newLayerOpacity });
      }
    });
  }

  componentWillUnmount() {
    // Clean up subscription
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.visibleLayers.includes(this.props.layer.id) &&
      !this.props.visibleLayers.includes(this.props.layer.id) &&
      this.state.layerHidden
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
    const { visibleLayers } = store.getState();
    const layerId = this.props.layer.id;

    if (deforestationAlertsIds.includes(layerId)) {
      // Toggle the layer itself
      if (visibleLayers.includes(layerId)) {
        store.dispatch(turnLayerOff(layerId));
      }

      // Get the geographic coverage ID from the deforestation alerts map
      const coverageId = deforestationAlertsLayerToCoverageMap[layerId];

      // If there is a geographic coverage ID, toggle it
      if (coverageId && visibleLayers.includes(coverageId)) {
        store.dispatch(turnLayerOff(coverageId));
      }
      const { showHighConfidenceAlertsOnDeforestationAlertsLayer } = store.getState();
      if (showHighConfidenceAlertsOnDeforestationAlertsLayer) {
        store.dispatch(toggleHighConfidenceAlertsForDeforestationAlertsLayers());
      }
    } else if (layerId === clarkLabsAquacultureLandCover) {
      store.dispatch(toggleClarkLabsLayers());
      if (visibleLayers.includes(clarkLabsAquacultureLandCover)) {
        store.dispatch(toggleLayer(clarkLabsAquacultureLandCover));
      }
      if (visibleLayers.includes(clarkLabsAquacultureLandChange)) {
        store.dispatch(toggleLayer(clarkLabsAquacultureLandChange));
      }
    } else {
      store.dispatch(toggleLayer(layerId));
    }

    if (this.props.gfwListDef[layerId]) {
      this.clearGFWFilter();
    }
  };

  handleToggleCanopyModal = () => {
    store.dispatch(toggleCanopyModal());
  };

  handleToggleTreeCoverLossCanopyModal = () => {
    store.dispatch(toggleTreeCoverLossCanopyModal());
  };

  handleTclSwitchClick = () => {
    const isTclSwitchOn = this.props.treeCoverLossCanopyDensity > 0;
    store.dispatch(
      updateTreeCoverLossCanopyDensity(isTclSwitchOn ? 0 : DEFAULT_TREE_COVER_LOSS_CANOPY_DENSITY)
    );
  };

  handleOpacityChange(opacity) {
    const { layer } = this.props;
    if (layer && layer.id) {
      store.dispatch(setLayerOpacity({ layerId: layer.id, opacity }));
    }
  }

  toggleLayerVisibility = async () => {
    const { layer, visibleLayers, toggleLayerVisibility } = this.props;
    const layerId = layer.id;
    let layersToToggle = [layerId]; // Start with the main layer

    if (deforestationAlertsIds.includes(layerId)) {
      // Get the geographic coverage ID from the deforestation alerts map
      const coverageId = deforestationAlertsLayerToCoverageMap[layerId];
      // If there is a geographic coverage ID, toggle it
      if (coverageId && visibleLayers.includes(coverageId)) {
        layersToToggle.push(coverageId);
      }
    } else if (layerId === clarkLabsAquacultureLandCover) {
      [clarkLabsAquacultureLandCover, clarkLabsAquacultureLandChange].forEach((id) => {
        if (visibleLayers.includes(id) && !layersToToggle.includes(id)) {
          layersToToggle.push(id);
        }
      });
    } else if (layerId === disturbanceAlertsDriversId) {
      if (
        disturbanceAlertsDriversGeographicCoverageId &&
        visibleLayers.includes(disturbanceAlertsDriversGeographicCoverageId)
      ) {
        layersToToggle.push(disturbanceAlertsDriversGeographicCoverageId);
      }
    }

    layersToToggle.forEach((id) => toggleLayerVisibility(id)); // Toggle all collected layers

    this.setState((prev) => ({
      layerHidden: !prev.layerHidden,
    }));
  };

  layerLegendMap = (symbol, i) => {
    const symbolStyle = {
      background: symbol.color,
    };
    return (
      <li key={`${i}${symbol.name}`}>
        <span className="layer-legend-symbol" style={symbolStyle}></span>
        <span className="layer-legend-label">{symbol.name}</span>
        {symbol?.subCategories && (
          <ul className="layer-legend__subcategory">
            {symbol.subCategories.map((subCategory) => (
              <li key={subCategory}>{subCategory}</li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  displayWarning = () => {
    const layerWarning = layerWarnings.find((warning) => warning.id === this.props.layer.id);

    store.dispatch(showBasemapInfo(layerWarning.content));
  };

  soyPlantedYearPicker = (layer) => {
    const { soyYear } = store.getState();
    const years = _range(soyPlantedYearsRange[0], soyPlantedYearsRange[1] + 1);
    return (
      <>
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
      </>
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
    const layerWarning = layerWarnings.find((warning) => warning.id === layer.id);

    const symbolStyle = {
      fill: 'green',
    };

    if (symbolsLength === 1) {
      symbolStyle.fill = layer.legendConfig.items[0].color;
    }

    let hidden;

    if (layer.id === clarkLabsAquacultureLandCover) {
      hidden = store.getState().clarkLabsLayers ? '' : 'hidden';
    } else {
      // we hide the legend for deforestationAlertsGeographicCoverageIds as they depend on the deforestation alerts
      hidden =
        visibleLayers.indexOf(layer.id) === -1 ||
        deforestationAlertsGeographicCoverageIds.includes(layer.id)
          ? 'hidden'
          : '';
    }
    const isInfoButtonVisible = !!layer.metadataId;
    const isTclSwitchOn = this.props.treeCoverLossCanopyDensity > 0;
    const opacity = this.state.layerOpacity?.[this.props.layer.id] ?? 1;
    return (
      <div
        className={`legend-list-item ${layer.group} ${grayed} ${hidden}`}
        id={layer.id + '-layer-checkbox'}
      >
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <span
              onClick={this.toggleLayerVisibility}
              className={`legend-checkbox-icon icon-eye pointer ${grayed} ${
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
            <span className="legend-layer-name">{layer.name}</span>

            <span className="layer-checkbox-label">{label}</span>
          </div>

          <div className="layer-actions">
            <div className="layer-actions__action-button">
              <OpacitySlider
                value={opacity}
                onChange={(value) => this.handleOpacityChange(value)}
              />
            </div>

            {gfwListDef &&
              Object.keys(gfwListDef).length > 0 &&
              Object.keys(gfwListDef)[0] === layer.id && (
                <div className="layer-actions__action-button">
                  <span
                    className="legend-checkbox-icon gfw-filter pointer"
                    onClick={this.clearGFWFilter}
                  >
                    <svg>
                      <use xlinkHref="#shape-close" />
                    </svg>
                  </span>
                </div>
              )}

            {isInfoButtonVisible && (
              <div className="layer-actions__action-button">
                <span
                  className={`legend-checkbox-icon metadata-legend pointer ${
                    iconLoading === layer.id ? 'iconLoading' : ''
                  }`}
                  onClick={this.showInfo}
                >
                  <svg>
                    <use xlinkHref="#shape-info" />
                  </svg>
                </span>
              </div>
            )}

            <div className="layer-actions__action-button">
              <span className="legend-checkbox-icon pointer" onClick={this.hideLayer}>
                <svg>
                  <use xlinkHref="#shape-close" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {layer.id === soyPlantedArea ? this.soyPlantedYearPicker(layer) : null}

        {symbolsLength > 1 && layer.id !== soyPlantedArea ? (
          <ul className="layer-legend">{layer.legendConfig.items.map(this.layerLegendMap)}</ul>
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

        {deforestationAlertsIds.includes(layer.id) && (
          <DeforestationAlertsLayerLegend disabled={grayed} layerId={layer.id} />
        )}

        {disturbanceAlertsDriversId.includes(layer.id) && (
          <DriverOfDisturbanceAlertsLayerLegend disabled={grayed} />
        )}

        {globalVegetationDisturbanceAlertsId.includes(layer.id) && (
          <GlobalVegetationDisturbanceAlertsLayerLegend disabled={grayed} />
        )}

        {layer.id === globalIntegratedDisturbanceAlertsId && (
          <GlobalIntegratedDisturbanceAlertsLayerLegend disabled={grayed} />
        )}

        {symbolsLength === 1 &&
        categoriesLength > 0 &&
        !deforestationAlertsIds.includes(layer.id) &&
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
              onClick={this.handleToggleCanopyModal}
              className="layer-legend-loss-display"
            >{`>${this.props.canopyDensity}%`}</span>
            {mapPage.densityLossEnd}
          </p>
        ) : null}
        {densityDisplayLayers.indexOf(layer.id) > -1 ? (
          <p className="layer-legend-message">
            {mapPage.densityLossStart}
            <span
              onClick={this.handleToggleCanopyModal}
              className="layer-legend-loss-display"
            >{`>30%`}</span>
            {mapPage.densityLossEnd}
          </p>
        ) : null}
        {layer.id === treeCoverLossID ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box onClick={this.handleTclSwitchClick} sx={{ '&:hover': { cursor: 'pointer' } }}>
              <Switch
                id={`tree-cover-loss-switch-${layer.id}`}
                name={`treeCoverLossCanopyDensity-${layer.id}`}
                checked={isTclSwitchOn}
              />
            </Box>
            {!isTclSwitchOn ? (
              <p className="layer-legend-message layer-legend-message--tcl">
                No canopy density filter applied.
              </p>
            ) : (
              <p className="layer-legend-message layer-legend-message--tcl">
                Displaying loss with
                <span
                  onClick={this.handleToggleTreeCoverLossCanopyModal}
                  className="layer-legend-loss-display "
                >{`>${this.props.treeCoverLossCanopyDensity}%`}</span>
                {mapPage.densityLossEnd}
              </p>
            )}
            <HelperTextWithPopover sx={{ svg: { fontSize: '0.875rem' } }}>
              <Box sx={{ width: (theme) => theme.spacing(37), p: 1 }}>
                <Typography variant="caption">
                  When comparing the map to the Post-2020 Risk Assessment, ensure that the canopy
                  density filter for the Tree Cover Loss map layer is turned off and the date range
                  is filtered to 2021 onward, then use either the {proLayers.sbtnNaturalLands} Map
                  or the JRC Global Map of Forest Cover to assess the overlap between layers. The
                  canopy density filter is based on the 2000 tree cover layer used in the Post-2000
                  Forest Change analysis and allows for adjustments, while both the{' '}
                  {proLayers.sbtnNaturalLands} Map and JRC Global Map of Forest Cover already
                  account for canopy density. Leaving this filter on may cause relevant loss to be
                  excluded from the map view. When comparing the map to the Post-2000 Forest Change
                  analysis, ensure that the canopy density filter is turned on and set to 30% to
                  match the threshold used in that analysis.
                </Typography>
              </Box>
            </HelperTextWithPopover>
          </Box>
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
            For more information about this layer{' '}
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
