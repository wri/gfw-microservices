import { useState, useEffect, useCallback } from 'react';
import store from '../../store';
import _range from 'lodash/range';
import { Box, Typography } from '@mui/material';
import { HelperTextWithPopover, Switch, YearRangeSlider } from '../../../../components';
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
  setLayerOpacity as setLayerOpacityAction,
  setFireDays,
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
  treeCoverGainID,
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
import ClarkLabsLayerLegend from './ClarkLabsLayerLegend';
import {
  deforestationAlertsIds,
  deforestationAlertsGeographicCoverageIds,
  deforestationAlertsLayerToCoverageMap,
} from './DeforestationAlerts/deforestationAlerts.constants';
import './LegendCheckbox.scss';
import { GlobalVegetationDisturbanceAlertsLayerLegend } from './custom/GlobalVegetationDisturbanceAlertsLayerLegend';
import { GlobalIntegratedDisturbanceAlertsLayerLegend } from './custom/GlobalIntegratedDisturbanceAlertsLayerLegend';

const LegendCheckbox = (props) => {
  const { layer, visibleLayers, iconLoading, gfwListDef } = props;

  const [layerHidden, setLayerHidden] = useState(false);
  const [layerOpacity, setLayerOpacity] = useState(store.getState().layerOpacity || {});

  // Subscribe to store changes to update opacity
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const newLayerOpacity = store.getState().layerOpacity || {};
      setLayerOpacity(newLayerOpacity);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // componentDidUpdate equivalent - check if layer was removed from visibleLayers
  useEffect(() => {
    if (!visibleLayers.includes(layer.id) && layerHidden) {
      setLayerHidden(false);
    }
  }, [visibleLayers, layer.id, layerHidden]);

  const clearGFWFilter = useCallback(() => {
    store.dispatch(updateGFWLocations({}));
  }, []);

  const showInfo = useCallback(() => {
    store.dispatch(showLoading(layer.id));
    store.dispatch(getLayerInfo(layer));
  }, [layer]);

  const updateBiomassMin = useCallback((evt) => {
    store.dispatch(setBiomassMinRange(evt.target.value));
  }, []);

  const updateBiomassMax = useCallback((evt) => {
    store.dispatch(setBiomassMaxRange(evt.target.value));
  }, []);

  const handleBiomassTimelineChange = (startYear, endYear) => {
    if (typeof props.setBiomassTimeline === 'function') {
      props.setBiomassTimeline(startYear, endYear);
    }
  };

  const handleTreeCoverTimelineChange = (startYear, endYear) => {
    if (typeof props.setLossTimeline === 'function') {
      props.setLossTimeline(startYear, endYear);
    }
  };

  const hideLayer = useCallback(() => {
    const { visibleLayers } = store.getState();
    const layerId = layer.id;

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

    if (gfwListDef[layerId]) {
      clearGFWFilter();
    }
  }, [layer.id, gfwListDef, clearGFWFilter]);

  const handleToggleCanopyModal = useCallback(() => {
    store.dispatch(toggleCanopyModal());
  }, []);

  const handleToggleTreeCoverLossCanopyModal = useCallback(() => {
    store.dispatch(toggleTreeCoverLossCanopyModal());
  }, []);

  const handleTclSwitchClick = useCallback(() => {
    const isTclSwitchOn = props.treeCoverLossCanopyDensity > 0;
    store.dispatch(
      updateTreeCoverLossCanopyDensity(isTclSwitchOn ? 0 : DEFAULT_TREE_COVER_LOSS_CANOPY_DENSITY)
    );
  }, [props.treeCoverLossCanopyDensity]);

  const handleOpacityChange = useCallback(
    (opacity) => {
      if (layer && layer.id) {
        store.dispatch(setLayerOpacityAction({ layerId: layer.id, opacity }));
      }
    },
    [layer]
  );

  const toggleLayerVisibility = useCallback(async () => {
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

    layersToToggle.forEach((id) => props.toggleLayerVisibility(id)); // Toggle all collected layers

    setLayerHidden((prev) => !prev);
  }, [layer.id, visibleLayers, props]);

  const layerLegendMap = useCallback((symbol, i) => {
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
  }, []);

  const displayWarning = useCallback(() => {
    const layerWarning = layerWarnings.find((warning) => warning.id === layer.id);
    store.dispatch(showBasemapInfo(layerWarning.content));
  }, [layer.id]);

  const soyPlantedYearPicker = useCallback(
    (layer) => {
      const { soyYear } = store.getState();
      const years = _range(soyPlantedYearsRange.from, soyPlantedYearsRange.to + 1);
      return (
        <>
          <ul className="layer-legend">{layer.legendConfig.items.map(layerLegendMap)}</ul>
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
    },
    [layerLegendMap]
  );

  const firesTimeframePicker = () => {
    const timeframeOptions = [
      { value: 7, label: 'Past Week' },
      { value: 3, label: 'Past 72 Hours' },
      { value: 2, label: 'Past 48 Hours' },
      { value: 1, label: 'Past 24 Hours' },
    ];
    const currentFireDays = props.fireDays || 7;
    const selectedOption = timeframeOptions.find((opt) => opt.value === currentFireDays);

    return (
      <div className="fires-timeframe-picker">
        <p className="layer-legend-message">{'Displaying fires from'}</p>
        <div className="landsat-dropdown-root">
          <GfwSelect
            options={timeframeOptions}
            value={selectedOption}
            onChange={(evt) => {
              store.dispatch(setFireDays(Number(evt.value)));
            }}
          />
        </div>
      </div>
    );
  };

  const setupYearRangeConfig = (years, dateRangeProp, timelineSetterName, isGrayed) => {
    if (!years || years.length === 0) {
      return null;
    }

    const minYear = years[0];
    const maxYear = years[years.length - 1];
    const dateRange = dateRangeProp || {};
    const selectedStartYear =
      typeof dateRange.startYear === 'number' ? dateRange.startYear : minYear;
    const selectedEndYear = typeof dateRange.endYear === 'number' ? dateRange.endYear : maxYear;
    const sliderDisabled = isGrayed || typeof props[timelineSetterName] !== 'function';
    const marks =
      years.length > 1
        ? [
            { value: minYear, label: String(minYear) },
            { value: maxYear, label: String(maxYear) },
          ]
        : undefined;

    return {
      minYear,
      maxYear,
      selectedStartYear,
      selectedEndYear,
      sliderDisabled,
      marks,
    };
  };

  // Render function body
  const label = layer.legendConfig.items[0].name;
  const grayed = layerHidden ? 'grayed' : '';
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
  const isTclSwitchOn = props.treeCoverLossCanopyDensity > 0;
  const opacity = layerOpacity?.[layer.id] ?? 1;

  const isGrayed = grayed === 'grayed';

  const biomassConfig = setupYearRangeConfig(
    mapPage.biomassLossYears,
    props.biomassLossDateRange,
    'setBiomassTimeline',
    isGrayed
  );
  const treeCoverConfig = setupYearRangeConfig(
    mapPage.treeCoverLossYearsFC,
    props.treeCoverLossDateRange,
    'setLossTimeline',
    isGrayed
  );

  return (
    <div
      className={`legend-list-item ${layer.group} ${grayed} ${hidden}`}
      id={layer.id + '-layer-checkbox'}
    >
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <span
            onClick={toggleLayerVisibility}
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
            <OpacitySlider value={opacity} onChange={handleOpacityChange} />
          </div>

          {gfwListDef &&
            Object.keys(gfwListDef).length > 0 &&
            Object.keys(gfwListDef)[0] === layer.id && (
              <div className="layer-actions__action-button">
                <span className="legend-checkbox-icon gfw-filter pointer" onClick={clearGFWFilter}>
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
                onClick={showInfo}
              >
                <svg>
                  <use xlinkHref="#shape-info" />
                </svg>
              </span>
            </div>
          )}

          <div className="layer-actions__action-button">
            <span className="legend-checkbox-icon pointer" onClick={hideLayer}>
              <svg>
                <use xlinkHref="#shape-close" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {layer.id === soyPlantedArea && soyPlantedYearPicker(layer)}

      {symbolsLength > 1 && layer.id !== soyPlantedArea && (
        <ul className="layer-legend">{layer.legendConfig.items.map(layerLegendMap)}</ul>
      )}

      {store.getState().clarkLabsLayers && layer.id === clarkLabsAquacultureLandCover && (
        <ClarkLabsLayerLegend
          disabled={layerHidden}
          landCoverLayer={layer}
          landChangeLayer={props.mapLayers.find(
            (layer) => layer.id === clarkLabsAquacultureLandChange
          )}
        />
      )}

      {deforestationAlertsIds.includes(layer.id) && (
        <DeforestationAlertsLayerLegend disabled={layerHidden} layerId={layer.id} />
      )}

      {disturbanceAlertsDriversId.includes(layer.id) && (
        <DriverOfDisturbanceAlertsLayerLegend disabled={layerHidden} />
      )}

      {globalVegetationDisturbanceAlertsId.includes(layer.id) && (
        <GlobalVegetationDisturbanceAlertsLayerLegend disabled={layerHidden} />
      )}

      {layer.id === globalIntegratedDisturbanceAlertsId && (
        <GlobalIntegratedDisturbanceAlertsLayerLegend disabled={layerHidden} />
      )}

      {symbolsLength === 1 &&
        categoriesLength > 0 &&
        !deforestationAlertsIds.includes(layer.id) &&
        layer.id !== clarkLabsAquacultureLandCover &&
        layer.id !== soyPlantedArea && (
          <ul className="layer-legend">
            {layer.legendConfig.items[0].categories.map(layerLegendMap)}
          </ul>
        )}
      {layer.id === aboveGroundBiomassId && (
        <p className="layer-legend-message">
          {mapPage.groundBiomassStart}
          <span
            onClick={handleToggleCanopyModal}
            className="layer-legend-loss-display"
          >{`>${props.canopyDensity}%`}</span>
          {mapPage.densityLossEnd}
        </p>
      )}
      {densityDisplayLayers.indexOf(layer.id) > -1 && (
        <p className="layer-legend-message">
          {mapPage.densityLossStart}
          <span
            onClick={handleToggleCanopyModal}
            className="layer-legend-loss-display"
          >{`>30%`}</span>
          {mapPage.densityLossEnd}
        </p>
      )}
      {layer.id === treeCoverLossID && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Box onClick={handleTclSwitchClick} sx={{ '&:hover': { cursor: 'pointer' } }}>
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
                onClick={handleToggleTreeCoverLossCanopyModal}
                className="layer-legend-loss-display "
              >{`>${props.treeCoverLossCanopyDensity}%`}</span>
              {mapPage.densityLossEnd}
            </p>
          )}
          <HelperTextWithPopover sx={{ svg: { fontSize: '0.875rem' } }}>
            <Box sx={{ width: (theme) => theme.spacing(37), p: 1 }}>
              <Typography variant="caption">
                When comparing the map to the Post-2020 Risk Assessment, ensure that the canopy
                density filter for the Tree Cover Loss map layer is turned off and the date range is
                filtered to 2021 onward, then use either the {proLayers.sbtnNaturalLands} Map or the
                JRC Global Map of Forest Cover to assess the overlap between layers. The canopy
                density filter is based on the 2000 tree cover layer used in the Post-2000 Forest
                Change analysis and allows for adjustments, while both the{' '}
                {proLayers.sbtnNaturalLands} Map and JRC Global Map of Forest Cover already account
                for canopy density. Leaving this filter on may cause relevant loss to be excluded
                from the map view. When comparing the map to the Post-2000 Forest Change analysis,
                ensure that the canopy density filter is turned on and set to 30% to match the
                threshold used in that analysis.
              </Typography>
            </Box>
          </HelperTextWithPopover>
        </Box>
      )}
      {layer.id === treeBiomassLossID && (
        <>
          {biomassConfig && (
            <Box sx={{ mr: 2.5, mt: 2 }}>
              <YearRangeSlider
                startYear={biomassConfig.selectedStartYear}
                endYear={biomassConfig.selectedEndYear}
                minYear={biomassConfig.minYear}
                maxYear={biomassConfig.maxYear}
                marks={biomassConfig.marks}
                disabled={biomassConfig.sliderDisabled}
                onYearChange={handleBiomassTimelineChange}
                sliderSx={{
                  '& .MuiSlider-markLabel:first-of-type': {
                    left: '3%',
                  },
                  '& .MuiSlider-markLabel:last-of-type': {
                    left: '70%',
                  },
                }}
              />
            </Box>
          )}
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
                  onChange={updateBiomassMin}
                  value={props.biomassRange.min}
                />
              </span>
              to
              <span className="canopy-range-button">
                <input
                  type="number"
                  step="1"
                  onChange={updateBiomassMax}
                  value={props.biomassRange.max}
                />
              </span>
            </span>
          </div>
        </>
      )}
      {layer.id === treeCoverGainID && treeCoverConfig && (
        <Box sx={{ mr: 2.5, mt: 2 }}>
          <YearRangeSlider
            startYear={treeCoverConfig.selectedStartYear}
            endYear={treeCoverConfig.selectedEndYear}
            minYear={treeCoverConfig.minYear}
            maxYear={treeCoverConfig.maxYear}
            marks={treeCoverConfig.marks}
            disabled={treeCoverConfig.sliderDisabled}
            onYearChange={handleTreeCoverTimelineChange}
            sliderSx={{
              '& .MuiSlider-markLabel:first-of-type': {
                left: '3%',
              },
              '& .MuiSlider-markLabel:last-of-type': {
                left: '70%',
              },
            }}
          />
        </Box>
      )}
      {layer.id === aboveGroundBiomassId && (
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
      )}
      {layerWarning && (
        <p className="layer-legend-message">
          {layerWarning.title}
          <span onClick={displayWarning} className="layer-legend-warning-source">
            ?
          </span>
        </p>
      )}
      {layer.id === viirsActiveFiresID && (
        <>
          {firesTimeframePicker()}
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
        </>
      )}
    </div>
  );
};

export default LegendCheckbox;
