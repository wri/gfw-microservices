import { Component } from 'react';
import _intersection from 'lodash/intersection';

import {
  showBasemapInfo,
  showLayerInfo,
  toggleDrawing,
  toggleDrawShapeNoteDetailsModal,
  updateAdminSelections,
  updateAnalysis,
  updateLandsatYear,
} from '../../actions/mapActions';
import * as analysisActions from '../../actions/analysisActions';
import utils from '../../utils/AppUtils';

import { mapPage } from '../../../../common/js/config';
import {
  proLayers,
  analysisEnabledLayers,
  visibleLayers as visibleLayersConstants,
  downloadLinks,
} from '../../../../common/js/proLayers.config';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';

import { PillButton } from '../../../../components';
import GfwSelect from '../../../../common/js/components/GfwSelect';

import { PlanetTilesOptions } from './PlanetTilesOptions/PlanetTilesOptions';
import MapRecenterButton from '../modals/MapRecenterButton';
import { PLANET_BASEMAP } from '../../config/map.config';
import store from '../../store';
import CountryOrRegionAnalysis from './CountryOrRegionAnalysis';

const {
  gladAlertsID,
  raddAlertsID,
  treeBiomassLossID,
  treeCoverGainID,
  treeCoverID,
  treeCoverLossID,
  viirsActiveFiresID,
} = proLayers;

export default class AnalysisPanel extends Component {
  constructor(props) {
    super(props);

    const areInitialAnalysisLayersVisible = this.checkInitialAnalysisVisibility(props);

    this.state = {
      isAnalysisDisabled: !areInitialAnalysisLayersVisible,
      activeBasemap: 'national-geographic',
      activeAnalysis: props.activeAnalysis,
      dndActive: false,
      country: '',
      smallerRegion: '',
    };
  }

  componentDidMount() {
    const areInitialAnalysisLayersVisible = this.checkInitialAnalysisVisibility(this.props);

    store.dispatch(analysisActions.setAnalysis(areInitialAnalysisLayersVisible ? 'analysis' : ''));
  }

  componentDidUpdate(prevProps) {
    const previousForestChange = prevProps.visibleLayers.some((layer) =>
      analysisEnabledLayers.includes(layer)
    );
    const currentForestChange = this.props.visibleLayers.some((layer) =>
      analysisEnabledLayers.includes(layer)
    );

    const prevRaddLayerVisible = prevProps.visibleLayers.includes(raddAlertsID);
    const currentRaddLayerVisible = this.props.visibleLayers.includes(raddAlertsID);

    if (
      (previousForestChange && !currentForestChange) ||
      (!prevRaddLayerVisible && currentRaddLayerVisible)
    ) {
      this.setState({
        isAnalysisDisabled: true,
      });
      store.dispatch(analysisActions.setAnalysis(''));
    } else if (
      previousForestChange !== currentForestChange &&
      this.props.userInfo.access_level_id !== 3
    ) {
      this.setState({
        isAnalysisDisabled: false,
      });
    } else if (
      prevRaddLayerVisible &&
      !currentRaddLayerVisible &&
      this.props.userInfo.access_level_id !== 3
    ) {
      this.setState({
        isAnalysisDisabled: false,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // Handle changes to active analysis
    if (nextProps.activeAnalysis !== this.state.activeAnalysis) {
      this.setState({ activeAnalysis: nextProps.activeAnalysis });
    }
  }

  checkInitialAnalysisVisibility(props) {
    return (
      visibleLayersConstants.some((layer) => analysisEnabledLayers.includes(layer)) &&
      props.userInfo.access_level_id !== 3
    );
  }

  showBasemapInfo = (evt) => {
    evt.stopPropagation();
    evt.target.classList.forEach((className) => {
      if (className.indexOf('-basemap-metadata') > -1) {
        const basemapId = className.split('-basemap-metadata');
        const basemapConfig = utils.getObject(mapPage.basemaps, 'id', basemapId[0]);
        store.dispatch(showBasemapInfo(basemapConfig.content));
      }
    });
  };

  handleSelectedLandsatYear = (evt, basemapId) => {
    this.setState({
      activeBasemap: basemapId,
    });
    store.dispatch(updateLandsatYear(evt.value));
  };

  generateBasemap = (basemap, j) => {
    const { activeBasemap } = this.state;
    const landsatYearOptions = [2013, 2014, 2015, 2016, 2017];
    const landsatYear = {
      value: this.props.landsatYear,
      label: this.props.landsatYear,
    };

    return (
      <div
        key={j}
        id={basemap.id}
        className={`basemap-selector ${activeBasemap === basemap.id ? 'basemap-selected' : ''}`}
        onClick={this.changeBasemap}
      >
        <span className={`basemap-image ${basemap.id}`} />
        <span className={`basemap-label ${basemap.id}`}>{basemap.label}</span>
        {basemap.id === 'landsat' && (
          <div className="landsat-dropdown-root">
            <GfwSelect
              options={landsatYearOptions}
              value={landsatYear}
              onChange={(evt) => this.handleSelectedLandsatYear(evt, basemap.id)}
            />
          </div>
        )}

        <span
          className={`info-icon metadata analysis-panel-metadata pointer ${
            basemap.id + '-basemap-metadata'
          }`}
          onClick={this.showBasemapInfo}
        >
          <svg className={`${basemap.id + '-basemap-metadata'}`}>
            <use xlinkHref="#shape-info" className={`${basemap.id + '-basemap-metadata'}`} />
          </svg>
        </span>
        {basemap.id === PLANET_BASEMAP && <PlanetTilesOptions />}
      </div>
    );
  };

  changeBasemap = (evt) => {
    let basemapId;
    if (evt.target.id) {
      basemapId = evt.target.id;
    } else if (
      evt.target.classList.contains('basemap-image') ||
      evt.target.classList.contains('basemap-label')
    ) {
      basemapId = evt.target.classList[1];
    }

    if (basemapId && this.state.activeBasemap !== basemapId) {
      this.props.changeBasemap(basemapId);
      this.setState({
        activeBasemap: basemapId,
      });
    }
  };

  numberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  toggleAnalysis = (evt) => {
    const { selectedAnalysis, drawingActive, analysisWarning } = this.props;
    const targetClasses = evt.target.classList;

    const isAnalysisHeader = targetClasses.contains('analysis-header-click');
    const isBasemapHeader = targetClasses.contains('basemap-header-click');
    const isDisabled = targetClasses.contains('disabled-header');

    const newAnalysis = isAnalysisHeader ? 'analysis' : isBasemapHeader ? 'basemap' : null;

    if (!newAnalysis) {
      return;
    }

    if (newAnalysis === selectedAnalysis) {
      if (drawingActive && newAnalysis === 'analysis') {
        this.startDrawing();
      }
      store.dispatch(analysisActions.setAnalysis(''));
      return;
    }

    if (!isDisabled) {
      store.dispatch(analysisActions.setAnalysis(newAnalysis));
      return;
    }

    if (!analysisWarning) {
      store.dispatch(analysisActions.toggleWarning());
      setTimeout(() => {
        if (this.props.analysisWarning) {
          store.dispatch(analysisActions.toggleWarning());
        }
      }, 5000);
    }
  };

  discardAnalysis = () => {
    const { sketchTool } = this.props;
    sketchTool.layer.removeAll();
    store.dispatch(updateAnalysis({}));
    store.dispatch(
      analysisActions.setAnalysisAdminArea({
        country: '',
        region: '',
      })
    );
    store.dispatch(
      updateAdminSelections({
        country: '',
        smallerRegion: '',
        subregion: '',
      })
    );
    this.props.setGeometry();
  };

  openDownload = () => {
    //Find the layer that we are running analysis on and open said layer's download link
    //In the case of tree cover loss and gain we may have two layers active so we always access the 0 index just to be on the safe side
    const analysisLayers = Object.keys(downloadLinks);
    const activeAnalysisLayers = _intersection(analysisLayers, this.props.visibleLayers);
    if (activeAnalysisLayers.length) {
      window.open(downloadLinks[activeAnalysisLayers[0]], '_blank');
    }
  };

  changeActive = (evt) => {
    const active = evt.target.id.split('-active-analysis')[0];
    if (
      active &&
      active !== this.state.activeAnalysis &&
      !evt.target.classList.contains('disabled-analysis')
    ) {
      if (this.props.drawingActive && active !== 'analysis') {
        this.startDrawing();
      }
      store.dispatch(analysisActions.setActiveAnalysis(active));
    }
  };

  subscribeAdmin = (selectedAdmin) => {
    const country = selectedAdmin ? selectedAdmin.country : this.state.country;
    const region = selectedAdmin ? selectedAdmin.region : this.state.smallerRegion;
    const { gadmId } = selectedAdmin;
    const adminObj = gadmId
      ? {
          country: country,
          region: region,
          gadmId: gadmId,
        }
      : null;
    this.props.locationsAfterState(adminObj);
  };

  addNewLocation = () => {
    const { adminSelections } = this.props;
    const { country, stateOrProvince, gadmId } = adminSelections;

    this.subscribeAdmin({
      country: country,
      region: stateOrProvince,
      gadmId: gadmId,
    });
  };

  setAdmin = (name) => {
    this.props.setLocationName(name);
  };

  showInstructions = () => {
    if (this.props.info.custom) {
      store.dispatch(showLayerInfo({}));
    } else {
      store.dispatch(showLayerInfo({ custom: true }));
    }
  };

  otherInstructions = (instruction, j) => {
    return (
      <li key={j} className="analysis__body__instructions__item">
        {instruction}
        {j === 0 ? (
          <span
            className="info-icon metadata layer-panel instructions pointer"
            onClick={this.showInstructions}
          >
            <svg>
              <use xlinkHref="#shape-info" />
            </svg>
          </span>
        ) : (
          ''
        )}
      </li>
    );
  };

  startDrawing = () => {
    const { sketchTool, closePopups } = this.props;
    closePopups();
    sketchTool.layer.removeAll();
    store.dispatch(toggleDrawing());
    sketchTool.create('polygon', { mode: 'hybrid' });
  };

  prevent = (evt) => {
    evt.preventDefault();
    return false;
  };

  enter = (evt) => {
    this.prevent(evt);
    this.setState({ dndActive: true });
  };

  leave = (evt) => {
    this.prevent(evt);
    this.setState({ dndActive: false });
  };

  render() {
    const {
      analyzeAdmin,
      analysisResults,
      cancelAnalysis,
      drawingActive,
      adminSelections,
      panelsVisible,
      selectedAnalysis,
      spinnerOn: isSpinnerVisible,
      visibleLayers,
    } = this.props;
    const { isAnalysisDisabled, activeAnalysis } = this.state;
    let className = 'analysis-tools ';
    if (!panelsVisible) {
      className += ' hidden';
    }
    const drawingLabel = drawingActive ? 'Cancel' : 'Start Drawing';

    const totalLabel = mapPage.totalSelected;
    let valueLabel = mapPage.totalLoss;
    let totalSelected = 0;
    let value = 0;
    let additionalValue, additionalLabel;

    if (analysisResults?.data) {
      const { attributes } = analysisResults.data;

      const format = (val, fixed = 2) => this.numberWithCommas(parseFloat(val).toFixed(fixed));

      const isVisible = (layerID) => visibleLayers.includes(layerID);

      if (isVisible(treeCoverLossID)) {
        const source = attributes.total || attributes;
        totalSelected = format(source.areaHa);
        value = format(source.loss);
      } else if (isVisible(treeCoverGainID)) {
        const source = attributes.total || attributes;
        totalSelected = format(source.areaHa);
        value = format(source.gain);
        valueLabel = 'GAIN';
      } else if (isVisible(treeBiomassLossID)) {
        totalSelected = format(attributes.areaHa);
        value = format(attributes.biomassLoss);
        valueLabel = treeBiomassLossID;
        additionalValue = format(attributes.biomass);
        additionalLabel = 'Total Biomass';
      } else if (isVisible(gladAlertsID)) {
        totalSelected = format(attributes.areaHa);
        value = format(attributes.value);
        valueLabel = 'GLAD';
      } else if (isVisible(viirsActiveFiresID)) {
        totalSelected = format(attributes.areaHa);
        value = this.numberWithCommas(parseFloat(attributes.value));
        valueLabel = 'VIIRS';
      } else if (isVisible(treeCoverID)) {
        totalSelected = format(attributes.areaHa);
        value = format(attributes.treeExtent);
        valueLabel = 'COVER';
      }
    }

    let totalCountLabel = '';
    const { country, stateOrProvince } = adminSelections || {};

    if (stateOrProvince) {
      totalCountLabel = `for ${stateOrProvince}`;
    } else if (country) {
      totalCountLabel = `for ${country}`;
    }

    return (
      <div className="analysis-tools__container">
        <div className={className}>
          <ul className="analysis__headers-list" id="layer-panel-nav">
            <button
              onClick={this.toggleAnalysis}
              className={`analysis__nav__item analysis-header-click ${
                selectedAnalysis === 'analysis' ? 'selected-analysis' : ''
              } ${isAnalysisDisabled ? 'disabled-analysis disabled-header' : ''}`}
            >
              <span
                className={`module-tabs header-tabs analysis-header-click ${
                  isAnalysisDisabled ? 'disabled-header' : ''
                }`}
                id="analysis-header-icon"
              >
                <svg
                  className={`analysis-header-click ${isAnalysisDisabled ? 'disabled-header' : ''}`}
                >
                  <use
                    className={`analysis-header-click ${
                      isAnalysisDisabled ? 'disabled-header' : ''
                    }`}
                    xlinkHref="#icon-tab-analysis"
                  />
                </svg>
              </span>
            </button>
            <button
              onClick={this.toggleAnalysis}
              id="basemapHeader"
              className={`analysis__nav__item basemap-header-click ${
                selectedAnalysis === 'basemap' ? 'selected-analysis' : ''
              }`}
            >
              <span
                className="module-tabs header-tabs pointer basemap-header-click"
                id="basemap-header-icon"
              >
                <svg className="basemap-header-click">
                  <use className="basemap-header-click" xlinkHref="#icon-basemap" />
                </svg>
              </span>
            </button>
          </ul>
          <div
            className={`analysis__body__item ${selectedAnalysis === 'analysis' ? '' : 'hidden'}`}
          >
            <ul className="analysis__body__list">
              <li
                id="draw-active-analysis"
                onClick={this.changeActive}
                className={`analysis__body__subtitle ${
                  analysisResults.data && activeAnalysis !== 'draw' ? 'disabled-analysis' : ''
                } ${activeAnalysis === 'draw' ? 'active-analysis' : ''}`}
              >
                {mapPage.drawTitle}
              </li>
              <li
                id="region-active-analysis"
                onClick={this.changeActive}
                className={`analysis__body__subtitle ${
                  analysisResults.data && activeAnalysis !== 'region' ? 'disabled-analysis' : ''
                } ${activeAnalysis === 'region' ? 'active-analysis' : ''}`}
              >
                {mapPage.countryTitle}
              </li>
            </ul>
            <div className={`analysis__body__cancel__button ${isSpinnerVisible ? '' : 'hidden'}`}>
              <PillButton
                variant="contained"
                color="error"
                size="small"
                onClick={() => cancelAnalysis()}
              >
                Cancel Analysis
              </PillButton>
            </div>
            <div
              className={`analysis__body__subitem ${
                activeAnalysis === 'draw' && !analysisResults.data ? '' : 'hidden'
              }`}
            >
              <div className="analysis__body__instructions">
                <ModalLoader position="absolute" size={60} open={isSpinnerVisible} />
                {mapPage.drawInstructions}
              </div>
              <div className="analysis__body__draw__button">
                <PillButton variant="contained" size="small" onClick={this.startDrawing}>
                  {drawingLabel}
                </PillButton>
              </div>
            </div>
            <div
              className={`analysis__body__subitem ${activeAnalysis === 'region' ? '' : 'hidden'}`}
            >
              <ModalLoader position="absolute" size={60} open={isSpinnerVisible} />

              <CountryOrRegionAnalysis
                setAdmin={this.setAdmin}
                analysisResults={analysisResults}
                analyzeAdmin={analyzeAdmin}
                adminSelections={adminSelections}
                subscribeAdmin={this.subscribeAdmin}
              />
            </div>
            <div
              className={`analysis__body__results ${
                analysisResults.data && !isSpinnerVisible ? '' : 'hidden'
              }`}
            >
              <p className="analysis__body__results__label">
                {totalLabel} {totalCountLabel}
              </p>
              <p className="analysis__body__results__value">
                {isNaN(totalSelected.toString().replace(/[,]+/g, ''))
                  ? 'Not Available'
                  : `${totalSelected} ha`}
              </p>
              <p className="analysis__body__results__label">
                {utils.setValueLabel(valueLabel, this.props)}
              </p>
              <p className="analysis__body__results__value loss-value">
                {isNaN(value.toString().replace(/[,]+/g, ''))
                  ? 'Not Available'
                  : utils.setValue(valueLabel, value)}
              </p>
              {additionalLabel ? (
                <p className="analysis__body__results__label">{additionalLabel}</p>
              ) : null}
              {additionalValue ? (
                <p className="analysis__body__results__value loss-value">{additionalValue}</p>
              ) : null}
              <p className="analysis__body__results__value warning-message">
                {mapPage.algorithmDisclaimer}
              </p>
              <p className="analysis__body__results__value warning-message">
                {mapPage.noteDisclaimer}{' '}
                <span
                  className="pointer link"
                  onClick={() => store.dispatch(toggleDrawShapeNoteDetailsModal())}
                >
                  Learn more.
                </span>
              </p>
            </div>
            <div
              className={`analysis__headers-list footer-list ${
                analysisResults.data ? '' : 'hidden'
              }`}
            >
              <div className="analysis__body__results__button">
                <PillButton variant="contained" size="small" onClick={this.addNewLocation}>
                  Add New Location
                </PillButton>
              </div>
              <div className="analysis-panel-button-wrap">
                <button
                  onClick={this.openDownload}
                  className="analysis__nav__item analysis-footer-click"
                >
                  <span className="module-tabs footer-tabs pointer" id="download-footer-icon">
                    <svg>
                      <use xlinkHref="#icon-download" />
                    </svg>
                  </span>
                  <span className="analysis-footer-label download-data-label">Download Data</span>
                </button>
                <button
                  onClick={this.discardAnalysis}
                  className="analysis__nav__item analysis-footer-click"
                >
                  <span className="module-tabs footer-tabs pointer" id="discard-footer-icon">
                    <svg>
                      <use xlinkHref="#icon-analysis-remove" />
                    </svg>
                  </span>
                  <span className="analysis-footer-label discard-label">Discard Analysis</span>
                </button>
              </div>
            </div>
          </div>
          <div
            className={`analysis__body__item basemap__item ${
              selectedAnalysis === 'basemap' ? '' : 'hidden'
            }`}
          >
            <div className="analysis-basemaps">{mapPage.basemaps.map(this.generateBasemap)}</div>
          </div>
        </div>

        <MapRecenterButton
          goToOriginalPoint={this.props.goToOriginalPoint}
          selectedList={this.props.selectedList}
          isMapMoving={this.props.isMapMoving}
          isMapCentered={this.props.isMapCentered}
        />
      </div>
    );
  }
}
