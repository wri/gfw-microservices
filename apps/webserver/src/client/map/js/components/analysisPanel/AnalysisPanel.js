import React, { Component } from 'react';

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
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';
import { mapPage, proLayers } from '../../../../common/js/config';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import FlatButton from 'material-ui/FlatButton';
import SelectAdmin from './SelectAdmin';
import utils from '../../utils/AppUtils';
import _intersection from 'lodash/intersection';

import GfwButton from '../../../../common/js/components/GfwButton';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { PlanetTilesOptions } from './PlanetTilesOptions/PlanetTilesOptions';

import store from '../../store';
import { PLANET_BASEMAP } from '../../config/map.config';

const {
  formaAlertsID,
  gladAlertsID,
  prodesDeforestationID,
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
    const initalAnalysisLayersVisible =
      mapPage.visibleLayers.some((layer) => mapPage.exclusiveLayers.includes(layer)) &&
      props.userInfo.access_level_id !== 3;
    this.state = {
      analysisDisabled: !initalAnalysisLayersVisible,
      activeBasemap: 'national-geographic',
      activeAnalysis: props.activeAnalysis,
      dndActive: false,
      isLoading: false,
      country: '',
      smallerRegion: '',
    };
  }

  componentDidMount() {
    const initalAnalysisLayersVisible =
      mapPage.visibleLayers.some((layer) => mapPage.exclusiveLayers.includes(layer)) &&
      this.props.userInfo.access_level_id !== 3;
    if (initalAnalysisLayersVisible) {
      store.dispatch(analysisActions.setAnalysis('analysis'));
    } else {
      store.dispatch(analysisActions.setAnalysis(''));
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const previousForestChange = prevProps.visibleLayers.some((layer) => mapPage.exclusiveLayers.includes(layer));
    const currentForestChange = this.props.visibleLayers.some((layer) => mapPage.exclusiveLayers.includes(layer));

    //TODO: Remove all radd layer checks when we have OTF analysis ready
    const prevRaddLayerVisible = prevProps.visibleLayers.includes(raddAlertsID);
    const currentRaddLayerVisible = this.props.visibleLayers.includes(raddAlertsID);

    if ((previousForestChange && !currentForestChange) || (!prevRaddLayerVisible && currentRaddLayerVisible)) {
      this.setState({
        analysisDisabled: true,
      });
      store.dispatch(analysisActions.setAnalysis(''));
    } else if (previousForestChange !== currentForestChange && this.props.userInfo.access_level_id !== 3) {
      this.setState({
        analysisDisabled: false,
      });
    } else if (prevRaddLayerVisible && !currentRaddLayerVisible && this.props.userInfo.access_level_id !== 3) {
      this.setState({
        analysisDisabled: false,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // Handle changes to active analysis
    if (nextProps.activeAnalysis !== this.state.activeAnalysis) {
      this.setState({ activeAnalysis: nextProps.activeAnalysis });
    }
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
              controlClassName="landsat-dropdown-control"
              menuClassName="landsat-dropdown-menu"
              arrowClassName="landsat-dropdown-arrow"
              options={landsatYearOptions}
              value={landsatYear}
              onChange={(evt) => this.handleSelectedLandsatYear(evt, basemap.id)}
            />
          </div>
        )}

        <span
          className={`info-icon metadata analysis-panel-metadata pointer ${basemap.id + '-basemap-metadata'}`}
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
    } else if (evt.target.classList.contains('basemap-image') || evt.target.classList.contains('basemap-label')) {
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
    let newAnalysis;
    if (evt.target.classList.contains('analysis-header-click')) {
      newAnalysis = 'analysis';
    } else if (evt.target.classList.contains('basemap-header-click')) {
      newAnalysis = 'basemap';
    }

    if (newAnalysis === this.props.selectedAnalysis) {
      if (this.props.drawingActive && newAnalysis === 'analysis') {
        this.startDrawing();
      }
      store.dispatch(analysisActions.setAnalysis(''));
    } else if (evt.target.classList.contains('disabled-header') === false) {
      store.dispatch(analysisActions.setAnalysis(newAnalysis));
    } else if (evt.target.classList.contains('disabled-header') && !this.props.analysisWarning) {
      store.dispatch(analysisActions.toggleWarning());
      setTimeout(() => {
        if (this.props.analysisWarning) {
          store.dispatch(analysisActions.toggleWarning());
        }
      }, 5000); //close the warning if it is still showing after 5 seconds of inactivity
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

  toggleShare = () => {
    console.log('clicked');
  };

  openDownload = () => {
    //Find the layer that we are running analysis on and open said layer's download link
    //In the case of tree cover loss and gain we may have two layers active so we always access the 0 index just to be on the safe side
    const analysisLayers = Object.keys(mapPage.downloadLinks);
    const activeAnalysisLayers = _intersection(analysisLayers, this.props.visibleLayers);
    if (activeAnalysisLayers.length) {
      window.open(mapPage.downloadLinks[activeAnalysisLayers[0]], '_blank');
    }
  };

  changeActive = (evt) => {
    const active = evt.target.id.split('-active-analysis')[0];
    if (active && active !== this.state.activeAnalysis && !evt.target.classList.contains('disabled-analysis')) {
      if (this.props.drawingActive && active !== 'analysis') {
        this.startDrawing();
      }
      store.dispatch(analysisActions.setActiveAnalysis(active));
    }
  };

  subscribeAdmin = (selectedAdmin) => {
    const { activeAnalysis } = this.state;

    const country = selectedAdmin ? selectedAdmin.country : this.state.country;
    const region = selectedAdmin ? selectedAdmin.region : this.state.smallerRegion;
    const { gadmId } = selectedAdmin;
    // Pass a null adminObj to support user-drawn shapes.
    // Pass a populated adminObj to support user-selected administrative area bounds.
    const adminObj = gadmId
      ? {
          country: country,
          region: region,
          gadmId: gadmId,
        }
      : null;
    this.props.locationsAfterState(adminObj);
  };

  discernGadm = () => {
    const prefix = 'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin/MapServer';
    const { adminSelections } = this.props;

    const queryTask = new QueryTask({
      url: adminSelections.smallerRegion ? `${prefix}/5` : `${prefix}/6`,
    });

    const query = new Query();
    query.where = adminSelections.smallerRegion
      ? `name_0 = '${adminSelections.country}' AND name_1 = '${adminSelections.smallerRegion}'`
      : `name_0 = '${this.props.adminSelections.country}'`;
    query.returnGeometry = false;
    query.outFields = ['gadmid']; //['name_0', 'name_1', 'name_2', 'gadmid'];// 'gadmid'

    queryTask.execute(query).then((res) => {
      const gadmId = res && res.features && res.features.length > 0 ? res.features[0].attributes.gadmid : '';
      this.subscribeAdmin({
        country: this.props.adminSelections.country,
        region: this.props.adminSelections.smallerRegion,
        gadmId: gadmId,
      });
    });
  };

  setAdmin = (adminState) => {
    //TODO: We need a globalId somehow!
    this.setState(adminState);
    const name = adminState.smallerRegion ? adminState.smallerRegion : adminState.country;
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
          <span className="info-icon metadata layer-panel instructions pointer" onClick={this.showInstructions}>
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
    const { sketchTool } = this.props;
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
      spinnerOn,
      visibleLayers,
      prodesDateRange,
    } = this.props;
    const { analysisDisabled, activeAnalysis } = this.state;
    let className = 'analysis-tools ';
    if (panelsVisible === false) {
      className += ' hidden';
    }
    const drawingLabel = drawingActive ? 'Cancel' : 'Start Drawing';

    const totalLabel = mapPage.totalSelected;
    let valueLabel = mapPage.totalLoss;
    let totalSelected = 0;
    let value = 0;
    let additionalValue, additionalLabel;

    if (analysisResults && analysisResults.data) {
      const attributes = analysisResults.data.attributes;
      if (visibleLayers.indexOf(treeCoverLossID) > -1) {
        if (attributes.total) {
          totalSelected = this.numberWithCommas(parseFloat(attributes.total.areaHa).toFixed(2));
          value = this.numberWithCommas(parseFloat(attributes.total.loss).toFixed(2));
        } else {
          totalSelected = this.numberWithCommas(parseFloat(attributes.areaHa).toFixed(2));
          value = this.numberWithCommas(parseFloat(attributes.loss).toFixed(2));
        }
      } else if (visibleLayers.indexOf(treeCoverGainID) > -1) {
        if (attributes.total) {
          totalSelected = this.numberWithCommas(parseFloat(attributes.total.areaHa).toFixed(2));
          value = this.numberWithCommas(parseFloat(attributes.total.gain).toFixed(2));
        } else {
          totalSelected = this.numberWithCommas(parseFloat(attributes.areaHa).toFixed(2));
          value = this.numberWithCommas(parseFloat(attributes.gain).toFixed(2));
        }
        valueLabel = 'GAIN';
      } else if (visibleLayers.indexOf(prodesDeforestationID) > -1) {
        totalSelected = this.numberWithCommas(parseFloat(attributes.areaHa).toFixed(2));
        value = this.numberWithCommas(parseFloat(attributes.value).toFixed(2));
        valueLabel = `PRODES TREE COVER LOSS (${prodesDateRange.startYear}-${prodesDateRange.endYear})`;
      } else if (visibleLayers.indexOf(treeBiomassLossID) > -1) {
        totalSelected = this.numberWithCommas(parseFloat(attributes.areaHa).toFixed(2));
        value = this.numberWithCommas(parseFloat(attributes.biomassLoss).toFixed(2));
        valueLabel = treeBiomassLossID;
        additionalValue = this.numberWithCommas(parseFloat(attributes.biomass).toFixed(2));
        additionalLabel = 'Total Biomass';
      } else if (visibleLayers.indexOf(gladAlertsID) > -1) {
        totalSelected = this.numberWithCommas(parseFloat(attributes.areaHa).toFixed(2));
        value = this.numberWithCommas(parseFloat(attributes.value).toFixed(2));
        valueLabel = 'GLAD';
      } else if (visibleLayers.indexOf(formaAlertsID) > -1) {
        totalSelected = this.numberWithCommas(parseFloat(attributes.areaHa).toFixed(2));
        value = this.numberWithCommas(parseFloat(attributes.alertCounts).toFixed(2));
        valueLabel = 'FORMA';
      } else if (visibleLayers.indexOf(viirsActiveFiresID) > -1) {
        totalSelected = this.numberWithCommas(parseFloat(attributes.areaHa).toFixed(2));
        value = this.numberWithCommas(parseFloat(attributes.value));
        valueLabel = 'VIIRS';
      } else if (visibleLayers.indexOf(treeCoverID) > -1) {
        totalSelected = this.numberWithCommas(parseFloat(attributes.areaHa).toFixed(2));
        value = this.numberWithCommas(parseFloat(attributes.treeExtent).toFixed(2));
        valueLabel = 'COVER';
      }
    }

    let totalCountLabel = '';
    if (adminSelections && adminSelections.smallerRegion) {
      totalCountLabel = `for ${adminSelections.smallerRegion}`;
    } else if (adminSelections && adminSelections.country) {
      totalCountLabel = `for ${adminSelections.country}`;
    }

    //TODO: Make sure that when our 'analysis__body__results' is hidden, the whole panel doesn't constrict and get small, we still need to see our cancel button!
    return (
      <div className={className}>
        <ul className="analysis__headers-list" id="layer-panel-nav">
          <FlatButton
            onClick={this.toggleAnalysis}
            id="analysisHeader"
            className={`analysis__nav__item analysis-header-click ${
              selectedAnalysis === 'analysis' ? 'selected-analysis' : ''
            } ${analysisDisabled ? 'disabled-analysis disabled-header' : ''}`}
            label=""
            icon={
              <span
                className={`module-tabs header-tabs analysis-header-click ${analysisDisabled ? 'disabled-header' : ''}`}
                id="analysis-header-icon"
              >
                <svg className={`analysis-header-click ${analysisDisabled ? 'disabled-header' : ''}`}>
                  <use
                    className={`analysis-header-click ${analysisDisabled ? 'disabled-header' : ''}`}
                    xlinkHref="#icon-tab-analysis"
                  />
                </svg>
              </span>
            }
          />
          <FlatButton
            onClick={this.toggleAnalysis}
            id="basemapHeader"
            className={`analysis__nav__item basemap-header-click ${
              selectedAnalysis === 'basemap' ? 'selected-analysis' : ''
            }`}
            label=""
            icon={
              <span className="module-tabs header-tabs pointer basemap-header-click" id="basemap-header-icon">
                <svg className="basemap-header-click">
                  <use className="basemap-header-click" xlinkHref="#icon-basemap" />
                </svg>
              </span>
            }
          />
        </ul>
        <div className={`analysis__body__item ${selectedAnalysis === 'analysis' ? '' : 'hidden'}`}>
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
          <div className={`analysis__body__cancel__button ${spinnerOn ? '' : 'hidden'}`}>
            <GfwButton
              classNames="AnalysisPanel__button btn-red text__semi-bold-12"
              value="Cancel Analysis"
              onClick={() => cancelAnalysis()}
            />
          </div>
          <div
            className={`analysis__body__subitem ${activeAnalysis === 'draw' && !analysisResults.data ? '' : 'hidden'}`}
          >
            <div className="analysis__body__instructions">
              <ModalLoader position="absolute" size={60} open={spinnerOn} />
              {mapPage.drawInstructions}
            </div>
            <div className="analysis__body__draw__button">
              <GfwButton
                classNames="AnalysisPanel__button btn-green text__semi-bold-12"
                value={drawingLabel}
                onClick={this.startDrawing}
              />
            </div>
          </div>
          <div className={`analysis__body__subitem ${activeAnalysis === 'region' ? '' : 'hidden'}`}>
            <ModalLoader position="absolute" size={60} open={spinnerOn} />
            <SelectAdmin
              setAdmin={this.setAdmin}
              analysisResults={analysisResults}
              analyzeAdmin={analyzeAdmin}
              adminSelections={adminSelections}
              subscribeAdmin={this.subscribeAdmin}
            />
          </div>
          <div className={`analysis__body__results ${analysisResults.data && spinnerOn === false ? '' : 'hidden'}`}>
            <p className="analysis__body__results__label">
              {totalLabel} {totalCountLabel}
            </p>
            <p className="analysis__body__results__value">
              {isNaN(totalSelected.toString().replace(/[,]+/g, '')) ? 'Not Available' : `${totalSelected} ha`}
            </p>
            <p className="analysis__body__results__label">{utils.setValueLabel(valueLabel, this.props)}</p>
            <p className="analysis__body__results__value loss-value">
              {isNaN(value.toString().replace(/[,]+/g, '')) ? 'Not Available' : utils.setValue(valueLabel, value)}
            </p>
            {additionalLabel ? <p className="analysis__body__results__label">{additionalLabel}</p> : null}
            {additionalValue ? <p className="analysis__body__results__value loss-value">{additionalValue}</p> : null}
            <p className="analysis__body__results__value warning-message">{mapPage.algorithmDisclaimer}</p>
            <p className="analysis__body__results__value warning-message">
              {mapPage.noteDisclaimer}{' '}
              <span className="pointer link" onClick={() => store.dispatch(toggleDrawShapeNoteDetailsModal())}>
                Learn more.
              </span>
            </p>
          </div>
          <div className={`analysis__headers-list footer-list ${analysisResults.data ? '' : 'hidden'}`}>
            <div className="analysis__body__results__button">
              <GfwButton
                classNames="AnalysisPanel__button btn-green text__semi-bold-12"
                value="Add New Location"
                onClick={() => this.discernGadm()}
              />
            </div>
            <div className="analysis-panel-button-wrap">
              <FlatButton
                onClick={this.openDownload}
                id="downloadDataFooter"
                className="analysis__nav__item analysis-footer-click"
                icon={
                  <span>
                    <span className="module-tabs footer-tabs pointer" id="download-footer-icon">
                      <svg>
                        <use xlinkHref="#icon-download" />
                      </svg>
                    </span>
                    <span className="analysis-footer-label download-data-label">Download Data</span>
                  </span>
                }
              />
              <FlatButton
                onClick={this.toggleShare}
                id="shareFooter"
                className="analysis__nav__item-share analysis-footer-click analysis-footer-click-share"
                icon={
                  <span>
                    <span className="module-tabs footer-tabs pointer" id="share-footer-icon"></span>
                    <span className="analysis-footer-label share-label"></span>
                  </span>
                }
              />
              <FlatButton
                onClick={this.discardAnalysis}
                id="discardAnalysisFooter"
                className="analysis__nav__item analysis-footer-click"
                icon={
                  <span>
                    <span className="module-tabs footer-tabs pointer" id="discard-footer-icon">
                      <svg>
                        <use xlinkHref="#icon-analysis-remove" />
                      </svg>
                    </span>
                    <span className="analysis-footer-label discard-label">Discard Analysis</span>
                  </span>
                }
              />
            </div>
          </div>
        </div>
        <div className={`analysis__body__item basemap__item ${selectedAnalysis === 'basemap' ? '' : 'hidden'}`}>
          <div className="analysis-basemaps">{mapPage.basemaps.map(this.generateBasemap)}</div>
        </div>
      </div>
    );
  }
}
