import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import DatePicker from 'material-ui/DatePicker';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import esriConfig from 'esri/config';
import Point from 'esri/geometry/Point';
import GeometryEngine from 'esri/geometry/geometryEngine';
import GeometryService from 'esri/tasks/GeometryService';
import AreasAndLengthsParameters from 'esri/tasks/support/AreasAndLengthsParameters';

import Upload from './Upload';
import DrawShape from './DrawShape';
import SelectAddress from './SelectAddress';
import SearchCoordinates from './SearchCoordinates';
import DescribeInvestment from './DescribeInvestment';
import DescribeLocation from './DescribeLocation';
import AddLocationCard from './AddLocationCard';
import AddList from './AddList';
import { fieldValidations } from '../../utils/validations';
import { containsPunctuation, getListStatusId } from '../../utils/lists.utils';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import httpRequest from '../../../../common/js/utils/httpRequest';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import SaveAsDraftNote from '../../../../common/js/components/SaveAsDraft/SaveAsDraftNote';
import SaveAsDraftButtonWithDialog from '../../../../common/js/components/SaveAsDraft/SaveAsDraftButtonWithDialog';

import { resetScroll } from '../../utils/scroll.utils';
import { locationsPage, proLayers } from '../../../../common/js/config';

// REDUX - Store
import store from '../../store';
import { changeAddMethod, changeAddType, changeTemplate } from '../../actions/locationActions';

import { esriQuery } from '../../utils/esriTasks';
import {
  appendListConfig,
  copyListConfig,
  saveAsDraftListConfig,
  saveListConfig,
} from '../../../../../config/config/locations.config';

import '../../../css/addLocation.scss';
import { getDialogContent, getDialogTitle } from '../../utils/dialogMessage.utils';
import { getGadmService } from '../../../../common/js/utils/getGadmService.utils';

const { protectedAreas, rspoConcessions, oilPalmConcessions, adminAreas, universalMillList } = proLayers;

const primaryColor = '#8bae3b';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: primaryColor,
    primary2Color: primaryColor,
    pickerHeaderColor: '#97bd3d',
  },
});

muiTheme.fontFamily = 'Fira Sans, sans-serif';

let originalState;

const DIALOG__SUBMIT_TITLE = 'Confirm Submission';
const DIALOG__SUBMIT_CONTENT =
  'Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete.';

const generateType = (gfwInfo) => {
  if (!gfwInfo.gfwData.hasOwnProperty('listName')) {
    return null;
  }
  let type;
  switch (gfwInfo.gfwData.listName) {
    case rspoConcessions:
      type = 'Palm Oil';
      break;
    case oilPalmConcessions:
      type = 'Palm Oil';
      break;
    case universalMillList:
      type = 'palmMill';
      break;
    case protectedAreas:
      type = 'Other';
      break;
    case adminAreas:
      type = 'Other';
      break;
    default:
      type = null;
      break;
  }
  return type;
};

// Helper fn that tries to look for values in adminData that come from the server in order to populate
// form with default pre-selected vals. Such inputs like certification, parent company, etc that come from server
const retrieveDefaultValue = (templateData, templateDropdowns, adminData) => {
  // early return unmodified templateData if no adminArea data is found
  if (!adminData) {
    return templateData;
  }

  // Do the work
  // Admin Data map represents value on geometry from the server
  const adminDataMap = [
    {
      origin: 'Mill ID',
      destination: 'ID',
    },
    {
      origin: 'Company ID',
      destination: 'Company ID',
    },
    {
      origin: 'Parent Company',
      destination: 'Parent Company',
    },
    {
      origin: 'Certification',
      destination: 'Certification',
    },
    {
      origin: 'RSPO Model',
      destination: 'RSPO Model',
    },
    {
      origin: 'Alternative Name',
      destination: 'Attribute1',
    },
    {
      origin: 'Group Name',
      destination: 'Attribute2',
    },
  ];

  const newTemplateData = templateData.map((t) => {
    const templateObject = { ...t };
    const matchingTemplate = adminDataMap.find(
      (admin) =>
        t.template_datum_field_name.length === admin.destination.length &&
        t.template_datum_field_name.includes(admin.destination)
    );
    if (matchingTemplate) {
      let adminVal = adminData.hasOwnProperty(matchingTemplate.origin) ? adminData[matchingTemplate.origin] : '';
      if (t.ui_type === 'multi-dropdown') {
        const multiDropDownVal = [];
        const templateDropdownsMatch = templateDropdowns.filter((d) => d.template_metadata_id === t.id);
        const templateDropdownsMatchIndex = templateDropdowns.findIndex((d) => d.template_metadata_id === t.id);
        // which one do we want to push, we try and match based on the incoming value
        const incomingTemplateDropdownVal = templateDropdownsMatch.find(
          (td) => td.dropdown_value.toLowerCase() === adminVal.toLowerCase()
        );

        if (incomingTemplateDropdownVal) {
          const dropDown = {
            label: incomingTemplateDropdownVal.dropdown_value,
            id: `${t.template_datum_field_name}_${
              incomingTemplateDropdownVal.template_metadata_id
            }${templateDropdownsMatchIndex}${1}`,
            value: incomingTemplateDropdownVal.dropdown_value,
          };
          multiDropDownVal.push(dropDown);
        }
        templateObject.template_datum_field_value = multiDropDownVal;
      } else {
        if (matchingTemplate.destination === 'RSPO Model') {
          // Cleaning up RSPO Model value by removing `RSPO Model,` at beginning at string
          adminVal = adminVal
            ? adminVal.split(',').map((val) => {
                return val.trim();
              })[1]
            : '';
        }
        templateObject.template_datum_field_value = adminVal;
        if (matchingTemplate.destination.includes('Attribute') && adminVal.length > 0) {
          templateObject.template_datum_field_name_updated = adminVal;
        }
      }
      return templateObject;
    }
    return templateObject;
  });
  return newTemplateData;

  // go through templateData and for those values that we have set items, modify the data
};

export default class AddLocation extends Component {
  constructor(props) {
    super(props);

    // Determine location name based on props that came from the map
    const locationName = props.geomFromMap && props.geomFromMap.locationName ? props.geomFromMap.locationName : '';

    const chosenType = props.gfwInfoFromMap && props.gfwInfoFromMap.gfwData ? generateType(props.gfwInfoFromMap) : null;

    this.state = {
      locationName,
      country: '',
      state: '',
      substate: '',
      gadmid: '',
      areaAround: '',
      customArea: '',
      calculatedArea: 0,
      chosenCommodity: chosenType,
      chosenInvestment: chosenType,
      startDate: {},
      endDate: {},
      geometry: {},
      originalGeometry: {},
      deduceAdminGeometry: {},
      timeframe: '',
      investmentCurrency: 'USD',
      investmentSize: null,
      windBarriers: '',
      riparian: '',
      bufferZones: '',
      saved: false,
      investmentTemplates: retrieveDefaultValue(
        this.props.templateData.filter((template) => template.location_type_name === 'Investment'),
        this.props.templateDropdowns,
        this.props.adminArea.adminData
      ),
      commodityTemplates: retrieveDefaultValue(
        this.props.templateData.filter((template) => template.location_type_name === 'Commodity'),
        this.props.templateDropdowns,
        this.props.adminArea.adminData
      ),
      selectedList: 'Create New List',
      customList: this.props.activeTemplate,
      measurementUnit: 'hectares',
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      dialogEmail: false,
      selectedLocationClassification: '',
      isAreaCalculated: false,
      lat: '',
      lng: '',
      overrideOnClose: false,
      isLoading: false,
    };

    require(['esri/geometry/support/webMercatorUtils'], (webMercatorUtils) => {
      this.WebMercatorUtils = webMercatorUtils;
    });

    originalState = this.state;

    esriConfig.request.corsEnabledServers.push('https://gis-gfw.wri.org');
    esriConfig.request.corsEnabledServers.push('https://production-api.globalforestwatch.org');
    esriConfig.request.corsEnabledServers.push('production-api.globalforestwatch.org');
  }

  // group_comp >>> parent group

  componentDidMount() {
    resetScroll();
    if (this.props.addType === 'investment') {
      let locationClassification = 'Recent Investments';
      if (this.checkExistingList(locationClassification)) {
        let count = 1;
        while (this.checkExistingList(locationClassification)) {
          const result = locationClassification.match(/([0-9]+)$/);
          let num = 0;
          if (result !== null) {
            num = parseInt(result[0]);
            locationClassification = `${locationClassification.substring(0, result.index)}${num + 1}`;
          } else {
            locationClassification = `${locationClassification} ${count}`;
          }
          count++;
        }
      }
      this.setState({ customList: locationClassification });
    }

    const { adminArea, geomFromMap } = this.props;
    if (geomFromMap && geomFromMap.geometry) {
      if (geomFromMap.geometry.rings) {
        store.dispatch(changeAddMethod('byDrawing'));
      } else if (adminArea && geomFromMap.geometry) {
        this.setState({
          substate: adminArea.substate,
          state: adminArea.state,
          country: adminArea.country,
          gadmid: adminArea.gadmid,
          geometry: geomFromMap.geometry,
          locationName: geomFromMap.locationName,
          saved: false,
        });
        store.dispatch(changeAddMethod('byDrawing'));
      }
    }

    // Check for pre-selected gfw lists and default select one of the commodity/investment types
    if (this.props.gfwInfoFromMap && this.props.gfwInfoFromMap.hasOwnProperty('gfwData')) {
      const investmentTemplate = this.props.templateData.filter(
        (template) => template.location_type_name === 'Investment'
      );

      // TODO: it is unclear why this is looking for template id 6 and using loose equality, it may be a mistake or be intentional
      const investmentTemplateTypes = investmentTemplate.filter((t) => t.id == 6)[0];
      this.editInvestmentTemplates(
        {
          value: this.state.chosenCommodity.hasOwnProperty('id')
            ? this.state.chosenCommodity.id
            : this.state.chosenCommodity,
        },
        investmentTemplateTypes
      );
    }

    // check for mills and override the template selection so we can "save" the form
    if (this.state.chosenCommodity === 'palmMill') {
      this.updateTemplateRadioSelection(locationsPage.upload.templateOptions.palmMill);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.geometry.centroid && !prevState.geometry.centroid) {
      this.deduceAdmin();
    } else if (
      this.state.geometry.centroid &&
      (this.state.geometry.centroid.latitude !== prevState.geometry.centroid.latitude ||
        this.state.geometry.centroid.longitude !== prevState.geometry.centroid.longitude)
    ) {
      this.deduceAdmin();
    } else if (
      this.state.geometry.latitude !== prevState.geometry.latitude ||
      this.state.geometry.longitude !== prevState.geometry.longitude
    ) {
      if (this.state.geometry.latitude) {
        this.deduceAdmin();
      }
    }
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (
      (nextProps.activeTemplate === 'palmGeneric' ||
        nextProps.activeTemplate === 'soyGeneric' ||
        nextProps.activeTemplate === 'cattleGeneric' ||
        nextProps.activeTemplate === 'cocoaGeneric') &&
      nextState.selectedLocationClassification !== '' &&
      nextState.selectedLocationClassification !== this.state.selectedLocationClassification
    ) {
      let locationClassification = `Recent ${deduceActiveName(nextProps.activeTemplate)} ${
        nextState.selectedLocationClassification
      }`;
      if (this.checkExistingList(locationClassification)) {
        let count = 1;
        while (this.checkExistingList(locationClassification)) {
          const result = locationClassification.match(/([0-9]+)$/);
          let num = 0;
          if (result !== null) {
            num = parseInt(result[0]);
            locationClassification = `${locationClassification.substring(0, result.index)}${num + 1}`;
          } else {
            locationClassification = `${locationClassification} ${count}`;
          }
          count++;
        }
      }
      this.setState({ customList: locationClassification });
    }

    if (this.props.activeTemplate !== nextProps.activeTemplate) {
      let newClass;
      if (
        nextProps.activeTemplate === 'soyFarm' ||
        nextProps.activeTemplate === 'palmFarm' ||
        nextProps.activeTemplate === 'palmPlantation' ||
        nextProps.activeTemplate === 'cocoa' ||
        nextProps.activeTemplate === 'cattle'
      ) {
        newClass = 'Property';
      } else if (
        nextProps.activeTemplate === 'soySilo' ||
        nextProps.activeTemplate === 'palmMill' ||
        nextProps.activeTemplate === 'beef'
      ) {
        newClass = 'Supply Shed';
      }

      if (newClass) {
        this.setState({ selectedLocationClassification: newClass });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeTemplate !== this.props.activeTemplate && nextProps.addType !== 'investment') {
      let locationClassification = `Recent ${deduceActiveName(nextProps.activeTemplate)}`;

      if (this.checkExistingList(locationClassification)) {
        let count = 1;
        while (this.checkExistingList(locationClassification)) {
          const result = locationClassification.match(/([0-9]+)$/);
          let num = 0;
          if (result !== null) {
            num = parseInt(result[0]);
            locationClassification = `${locationClassification.substring(0, result.index)}${num + 1}`;
          } else {
            locationClassification = `${locationClassification} ${count}`;
          }
          count++;
        }
      }

      this.setState({ customList: locationClassification });
    }
    if (nextProps.addType === 'investment') {
      let locationClassification = 'Recent Investments';
      if (this.checkExistingList(locationClassification)) {
        let count = 1;
        while (this.checkExistingList(locationClassification)) {
          const result = locationClassification.match(/([0-9]+)$/);
          let num = 0;
          if (result !== null) {
            num = parseInt(result[0]);
            locationClassification = `${locationClassification.substring(0, result.index)}${num + 1}`;
          } else {
            locationClassification = `${locationClassification} ${count}`;
          }
          count++;
        }
      }
      this.setState({ customList: locationClassification });
    }
  }

  updateTemplateRadioSelection(template) {
    const newTemplates = this.state.commodityTemplates.map((t) => {
      if (
        this.state.activeTemplate !== 'other' &&
        t.template_datum_field_name === 'Commodity' &&
        !t.template_datum_field_value
      ) {
        t.template_datum_field_value = t.template_datum_field_description;
      }
      return t;
    });

    this.setState({
      commodityTemplates: newTemplates,
      saved: false,
      chosenCommodity: template,
    });

    this.selectTemplate(template.id);
  }

  checkExistingList(locationClassification) {
    let result = false;
    this.props.orgLists.some((list) => {
      if (list.list_name === locationClassification) {
        result = true;
      }
    });
    return result;
  }

  createTimeframeRadio = (optionName, optionId, i) => {
    const { timeframe } = this.state;
    return (
      <div className="timeframe-option__container" key={`${i}radioDivKey`}>
        <input
          type="radio"
          onChange={this.changeTimeframeSelect}
          checked={timeframe === optionId}
          value={optionId}
          id={`${i}TimeframeRadio`}
          key={`${i}radioInputKey`}
          className="timeframe-option"
        />
        <label htmlFor={`${i}TimeframeRadio`} className="timeframe-option-label">
          {optionName}
        </label>
      </div>
    );
  };

  editInvestmentTemplates = (evt, template, multi) => {
    const newTemplates = [];
    this.state.investmentTemplates.forEach((stateTemplate) => {
      if (
        template.template_id === stateTemplate.template_id &&
        template.template_datum_field_name === stateTemplate.template_datum_field_name
      ) {
        if (multi) {
          template.template_datum_field_value = evt;
        } else if (evt.value !== undefined) {
          template.template_datum_field_value = evt.value;
        }
        newTemplates.push(template);
      } else {
        newTemplates.push(stateTemplate);
      }
    });

    this.setState({
      investmentTemplates: newTemplates,
      saved: false,
    });
  };

  editCommodityTemplates = (evt, template, multi) => {
    const newTemplates = [];
    this.state.commodityTemplates.forEach((stateTemplate) => {
      if (
        template.template_id === stateTemplate.template_id &&
        template.template_datum_field_name === stateTemplate.template_datum_field_name
      ) {
        if (multi) {
          template.template_datum_field_value = evt;
        } else if (evt.target && evt.target.classList.contains('value')) {
          if (stateTemplate.template_datum_type_id === 2 && Number(evt.target.value)) {
            // Int
            template.template_datum_field_value = Number(evt.target.value);
          } else {
            template.template_datum_field_value = evt.target.value;
          }
        } else if (evt.target && evt.target.classList.contains('tag')) {
          template.template_datum_field_name_updated = evt.target.value;
        } else {
          template.template_datum_field_value = evt.value || '';
        }
        newTemplates.push(template);
      } else {
        newTemplates.push(stateTemplate);
      }
    });

    if (template.template_datum_field_name === 'Location Classification') {
      this.setState({
        commodityTemplates: newTemplates,
        saved: false,
        selectedLocationClassification: template.template_datum_field_value ? template.template_datum_field_value : '',
      });
    } else {
      this.setState({
        commodityTemplates: newTemplates,
        saved: false,
      });
    }
  };

  changeAddTypeSelect = (val) => {
    if (val.value.toLowerCase() === 'commodity' && this.props.activeTemplate === 'investment') {
      store.dispatch(changeTemplate('palmMill'));
    }
    this.setState({
      locationName: '',
      saved: false,
      selectedLocationClassification: '',
    });
    if (val.value.toLowerCase() === 'investment') {
      store.dispatch(changeTemplate('investment'));
    }
    store.dispatch(changeAddType(val.value.toLowerCase()));
  };

  resetLocationClassification = () => {
    this.setState({
      selectedLocationClassification: '',
    });
  };

  changeTimeframeSelect = (e) => {
    const newVal = e.target.value;
    this.setState({
      startDate: null,
      endDate: null,
      timeframe: newVal,
      saved: false,
    });
  };

  updateStartDate = (evt, date) => {
    this.setState({
      startDate: date,
      saved: false,
    });
  };

  updateEndDate = (evt, date) => {
    this.setState({
      endDate: date,
      saved: false,
    });
  };

  setGeometry = (geometry) => {
    // Geometries need to be in WGS84 Spatial Reference - we've done our best to catch it here - good luck front end
    let wgsGeometry = {};

    if (geometry.spatialReference.wkid === 102100) {
      wgsGeometry = this.WebMercatorUtils.webMercatorToGeographic(geometry);
    } else {
      wgsGeometry = geometry;
    }

    if (geometry.latitude) {
      this.setState({
        geometry: wgsGeometry,
        originalGeometry: wgsGeometry,
        deduceAdminGeometry: wgsGeometry,
        saved: false,
      });
    } else {
      const geomService = new GeometryService(
        'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer'
      );
      const params = new AreasAndLengthsParameters({
        areaUnit: 'hectares',
        polygons: [wgsGeometry],
      });
      geomService.areasAndLengths(params).then((res) => {
        const area = res.areas && res.areas.length > 0 ? res.areas[0] : 0;

        this.setState({
          geometry: wgsGeometry,
          originalGeometry: wgsGeometry,
          deduceAdminGeometry: wgsGeometry,
          saved: false,
          calculatedArea: Math.abs(area.toFixed ? area.toFixed(2) : 0),
        });
      });
    }
  };

  setLat = (evt) => {
    this.setState({
      lat: evt.target.value,
    });
  };

  setLng = (evt) => {
    this.setState({
      lng: evt.target.value,
    });
  };

  setArea = (setRadius, customRadius) => {
    let { latitude } = this.state.geometry;
    let { longitude } = this.state.geometry;

    if (!latitude && this.state.geometry && this.state.geometry.centroid) {
      latitude = this.state.geometry.centroid.latitude;
      longitude = this.state.geometry.centroid.longitude;
    }
    if (latitude) {
      let distance;
      if (setRadius === 'small-area') {
        distance = 1.78;
      } else if (setRadius === 'medium-area') {
        distance = 3.99;
      } else if (setRadius === 'large-area') {
        distance = 7.98;
      } else {
        distance = parseFloat(customRadius);
      }

      if (!isNaN(distance)) {
        let buffer;

        if (this.state.measurementUnit === 'hectares' && setRadius === '') {
          const hectares_to_kilosSquared = distance / 100;
          const radius_in_KM = Math.sqrt(hectares_to_kilosSquared / Math.PI);
          buffer = GeometryEngine.geodesicBuffer(this.state.originalGeometry, radius_in_KM.toFixed(2), 'kilometers');
        } else {
          buffer = GeometryEngine.geodesicBuffer(this.state.originalGeometry, distance.toFixed(2), 'kilometers');
        }

        let area = 0;
        if (
          this.state.measurementUnit === 'kilometers' ||
          setRadius === 'small-area' ||
          setRadius === 'medium-area' ||
          setRadius === 'large-area'
        ) {
          area = distance ** 2 * Math.PI * 100;
        } else if (this.state.measurementUnit === 'hectares') {
          area = distance;
        }
        buffer.latitude = latitude;
        buffer.longitude = longitude;

        this.setState({
          geometry: buffer,
          areaAround: setRadius,
          customArea: customRadius,
          calculatedArea: area.toFixed(2),
          isAreaCalculated: true,
        });
      } else {
        this.setState({
          areaAround: setRadius,
          customArea: customRadius,
          calculatedArea: 0,
          isAreaCalculated: false,
        });
      }
    }
  };

  setMeaurementUnit = (evt) => {
    if (this.state.customArea) {
      if (evt.target.id === 'use-kilometers') {
        this.setState({
          measurementUnit: evt.target.id === 'use-kilometers' ? 'kilometers' : 'hectares',
          calculatedArea: '',
          customArea: '',
        });
      } else {
        this.setState({
          measurementUnit: evt.target.id === 'use-kilometers' ? 'kilometers' : 'hectares',
          calculatedArea: '',
          customArea: '',
        });
      }
    } else {
      this.setState({
        measurementUnit: evt.target.id === 'use-kilometers' ? 'kilometers' : 'hectares',
      });
    }
  };

  cancelAdd = () => {
    window.location.href = '/locations';
  };

  discardItem = () => {
    store.dispatch(changeTemplate('investment'));
    store.dispatch(changeAddType(''));
    this.props.templateData.forEach((template) => {
      if (template.template_datum_field_value) {
        delete template.template_datum_field_value;
      }
    });
    const newState = { ...originalState };
    newState.customList = 'investment';
    newState.investmentTemplates = this.props.templateData.filter(
      (template) => template.location_type_name === 'Investment'
    );
    newState.commodityTemplates = this.props.templateData.filter(
      (template) => template.location_type_name === 'Commodity'
    );
    this.setState(newState);
    store.dispatch(changeAddMethod('byAddress'));
    window.scrollTo(0, 0);
  };

  checkRequirements = () => {
    return false;
  };

  saveAndAddAnother = () => {
    if (this.state.saved === true) {
      this.discardItem();
    } else {
      this.setState({
        dialogOpen: true,
        dialogTitle: DIALOG__SUBMIT_TITLE,
        dialogMessage: DIALOG__SUBMIT_CONTENT,
      });
    }
  };

  validateEndDate = () => {
    const errorMessages = [];
    const endDate =
      this.state.endDate && this.state.endDate.getUTCFullYear
        ? `${
            this.state.endDate.getUTCMonth() + 1
          }/${this.state.endDate.getUTCDate()}/${this.state.endDate.getUTCFullYear()}`
        : '';
    if (!endDate && this.state.timeframe === 'Time Horizon') {
      errorMessages.push([40, locationsPage.add.errors.missingEndDate.message]);
    }
    return { endDate, errorMessages };
  };

  validateStartDate = () => {
    const errorMessages = [];
    const startDate =
      this.state.startDate && this.state.startDate.getUTCFullYear
        ? `${
            this.state.startDate.getUTCMonth() + 1
          }/${this.state.startDate.getUTCDate()}/${this.state.startDate.getUTCFullYear()}`
        : '';

    if (this.state.timeframe === 'Time Horizon') {
      if (!startDate) {
        errorMessages.push([40, locationsPage.add.errors.missingStartDate.message]);
      } else if (this.state.endDate && this.state.endDate.getUTCDate) {
        if (
          this.state.endDate.getUTCFullYear &&
          `${this.state.endDate.getUTCFullYear()}-${this.state.endDate.getUTCMonth()}${1}-${this.state.endDate.getUTCDate()}` <
            `${this.state.startDate.getUTCFullYear()}-${this.state.startDate.getUTCMonth()}${1}-${this.state.startDate.getUTCDate()}`
        ) {
          errorMessages.push([41, locationsPage.add.errors.endDateBeforeStartDate.message]);
        }
      }
    }
    return { startDate, errorMessages };
  };

  saveItem = ({ isSaveAsDraft }) => {
    const errorTitle = 'Mandatory fields missing';
    const errorMessages = [];

    const listName = this.state.selectedList === 'Create New List' ? this.state.customList : this.state.selectedList;
    // Check if customList is the same name as an existing list
    const checkListExists = this.props.userLists.find(
      (list) => list.list_name.toLowerCase() === listName.toLowerCase()
    );
    const checkForPunctuation = containsPunctuation(listName.toLowerCase());

    if (!listName) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Invalid List Name',
        dialogMessage: 'You must create a new list or select an existing one',
      });
      return;
    }
    if (checkListExists && this.state.selectedList === 'Create New List') {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'List not created',
        dialogMessage: 'A list already exists with this name. Enter a new list name and click save.',
      });
      return;
    }
    if (checkForPunctuation && this.state.selectedList === 'Create New List') {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Invalid List Name',
        dialogMessage:
          'The list name chosen contains punctuation. Please choose a list name with only letters, numbers, and/or spaces.',
      });
      return;
    }

    // We have to update the banner here because information is otherwise lost as the state is updated later in this function
    // set a cookie to pass along desired banner
    const now = new Date();
    const cookieExpire = new Date();
    const fiveMinutes = 1000 * 60 * 5;
    cookieExpire.setTime(now.getTime() + fiveMinutes);
    const bannerContent = isSaveAsDraft
      ? `${listName} has been saved as a draft. Click “Submit” to submit the list for analysis and receive results.`
      : `A new location has been added to the ${listName} list. You will receive an email once analysis is complete, and can reload the page to access the results.`;
    document.cookie = `LandingBannerContent=${bannerContent}; expires=${cookieExpire.toUTCString()}; path=/;`;

    if (this.state.saved === false) {
      if (!this.props.addType) {
        errorMessages.push([0, locationsPage.upload.missingAddTypeError]);
      }
      if (
        !this.state.geometry.centroid &&
        !this.state.geometry.latitude &&
        !this.state.geometry.longitude &&
        !this.state.geometry.rings
      ) {
        errorMessages.push([0, 'You must generate a valid geometry']);
      }
      if (
        !this.state.isAreaCalculated &&
        (this.props.addMethod === 'byAddress' ||
          this.props.addMethod === 'byCoordinates' ||
          this.props.addMethod === 'byPalmMill')
      ) {
        errorMessages.push([1, 'You must set an area around your point']);
      }

      const properties = {};
      const customAttributes = [];
      let templateId;
      if (this.props.addType === 'commodity') {
        const template_name = deduceActiveName(this.props.activeTemplate);

        const activeTemplates = this.state.commodityTemplates.filter((template) => {
          return template.template_name === template_name;
        });

        const customAttributeNames = ['Attribute1', 'Attribute2', 'Attribute3'];
        const customProps = [];
        activeTemplates.forEach((field) => {
          if (
            !field.template_datum_field_name_updated &&
            customAttributeNames.indexOf(field.template_datum_field_name) === -1
          ) {
            if (locationsPage.upload.ignoredCommodityFields.indexOf(field.template_datum_field_name) === -1) {
              let validField = true;
              let fieldValue = field.template_datum_field_value ? field.template_datum_field_value : '';
              if (fieldValue === 'Select...') {
                fieldValue = '';
              }

              // Certification value from the form comes in as array of all selected values that have labels in properties
              if (field.template_datum_field_name === 'Certification' && field.template_datum_field_value) {
                fieldValue = field.template_datum_field_value.length
                  ? field.template_datum_field_value.map((vals) => vals.label).join(', ')
                  : field.template_datum_field_value;
              }

              if (
                fieldValidations[field.template_datum_field_name] &&
                field.template_datum_field_name.toLowerCase() !== 'company id'
              ) {
                fieldValidations[field.template_datum_field_name].validations.forEach((validation) => {
                  if (validation(fieldValue) === false) {
                    validField = false;
                    const hasThisMessage = errorMessages.filter(
                      (message) => message[1] === fieldValidations[field.template_datum_field_name].text
                    )[0];
                    if (hasThisMessage) {
                      return;
                    }
                    errorMessages.push([20, fieldValidations[field.template_datum_field_name].text]);
                  }
                });
              } else if (
                fieldValidations[field.template_datum_field_name] &&
                field.template_datum_field_name.toLowerCase() === 'company id'
              ) {
                fieldValidations[field.template_datum_field_name].validations.forEach((validation) => {
                  if (validation(fieldValue, this.props.activeTemplate) === false) {
                    validField = false;
                    errorMessages.push([20, fieldValidations[field.template_datum_field_name].text]);
                  }
                });
              }

              if (validField) {
                if (!field.template_datum_field_description && field.template_datum_mandatory === true && !fieldValue) {
                  errorMessages.push([20, `${field.template_datum_field_name} is a mandatory field.`]);
                }
                properties[field.template_datum_field_name] = fieldValue;
              }
            } else {
              let valueFromState;
              let distance;

              switch (field.template_datum_field_name) {
                case 'Country':
                  valueFromState = this.state.country;
                  break;
                case 'State':
                  valueFromState = this.state.state;
                  break;
                case 'Sub State':
                  valueFromState = this.state.substate;
                  break;
                case 'Wind Barrier':
                  valueFromState = this.state.windBarriers;
                  break;
                case 'Riparian Buffers':
                  valueFromState = this.state.riparian;
                  break;
                case 'Buffer Zones':
                  valueFromState = this.state.bufferZones;
                  break;
                case 'Location Name':
                  valueFromState = this.state.locationName;
                  if (!valueFromState) {
                    errorMessages.push([3, 'You must enter a location name']);
                  }
                  break;
                case 'Start Date':
                  const startDateValidation = this.validateStartDate();
                  valueFromState = startDateValidation.startDate;
                  startDateValidation.errorMessages.forEach((e) => {
                    errorMessages.push(e);
                  });
                  break;
                case 'End Date':
                  const endDateValidation = this.validateEndDate();
                  valueFromState = endDateValidation.endDate;
                  endDateValidation.errorMessages.forEach((e) => {
                    errorMessages.push(e);
                  });
                  break;
                case 'Time Horizon':
                  valueFromState = this.state.timeframe === 'Time Horizon' ? '' : this.state.timeframe;
                  break;
                case 'Analysis Area':
                  valueFromState = parseFloat(this.state.calculatedArea);
                  break;
                case 'Analysis Radius':
                  if (this.state.areaAround === 'small-area') {
                    distance = 1.78;
                  } else if (this.state.areaAround === 'medium-area') {
                    distance = 3.99;
                  } else if (this.state.areaAround === 'large-area') {
                    distance = 7.98;
                  } else {
                    distance = parseFloat(this.state.customArea);
                  }
                  valueFromState = distance;
                  break;
                case 'gadmid':
                  valueFromState = this.state.gadmid;
                  break;
                default:
                  break;
              }
              properties[field.template_datum_field_name] = valueFromState;
            }
          } else if (
            field.template_datum_field_name === 'Attribute1' &&
            field.template_datum_field_name_updated &&
            field.template_datum_field_name_updated !== 'Attribute1'
          ) {
            if (field.template_datum_field_name_updated) {
              customProps.push({
                key: field.template_datum_field_name_updated,
                value: field.template_datum_field_value ? field.template_datum_field_value : '',
              });
              customAttributes.push({
                column_name: field.template_datum_field_name_updated,
                column_type: 'Text',
              });
            } else {
              customProps.push({
                key: field.template_datum_field_name,
                value: field.template_datum_field_value,
              });
              customAttributes.push({
                column_name: field.template_datum_field_name,
                column_type: 'Text',
              });
            }
          } else if (
            field.template_datum_field_name === 'Attribute2' &&
            field.template_datum_field_name_updated &&
            field.template_datum_field_name_updated !== 'Attribute2'
          ) {
            if (field.template_datum_field_name_updated) {
              customProps.push({
                key: field.template_datum_field_name_updated,
                value: field.template_datum_field_value ? field.template_datum_field_value : '',
              });
              customAttributes.push({
                column_name: field.template_datum_field_name_updated,
                column_type: 'Text',
              });
            } else {
              customProps.push({
                key: field.template_datum_field_name,
                value: field.template_datum_field_value,
              });
              customAttributes.push({
                column_name: field.template_datum_field_name,
                column_type: 'Text',
              });
            }
          } else if (
            field.template_datum_field_name === 'Attribute3' &&
            field.template_datum_field_name_updated &&
            field.template_datum_field_name_updated !== 'Attribute3'
          ) {
            if (field.template_datum_field_name_updated) {
              customProps.push({
                key: field.template_datum_field_name_updated,
                value: field.template_datum_field_value ? field.template_datum_field_value : '',
              });
              customAttributes.push({
                column_name: field.template_datum_field_name_updated,
                column_type: 'Text',
              });
            } else {
              customProps.push({
                key: field.template_datum_field_name,
                value: field.template_datum_field_value,
              });
              customAttributes.push({
                column_name: field.template_datum_field_name,
                column_type: 'Text',
              });
            }
          }
        });

        customProps.forEach((prop) => {
          properties[prop.key] = prop.value;
        });

        templateId = activeTemplates[0].template_id;
      } else if (this.props.addType === 'investment') {
        this.state.investmentTemplates.forEach((templateField) => {
          if (locationsPage.upload.ignoredInvestmentFields.indexOf(templateField.template_datum_field_name) === -1) {
            let validField = true;
            let fieldValue = templateField.template_datum_field_value ? templateField.template_datum_field_value : '';

            if (
              templateField.template_datum_field_name === 'Certification' &&
              templateField.template_datum_field_value &&
              templateField.template_datum_field_value.length
            ) {
              fieldValue = templateField.template_datum_field_value.length
                ? templateField.template_datum_field_value.map((vals) => vals.label).join(', ')
                : field.template_datum_field_value;
            }

            if (
              (fieldValue === '' && templateField.template_datum_type_id === 2) ||
              templateField.template_datum_type_id === 3
            ) {
              fieldValue = 0;
            }

            if (fieldValue === 'Select...') {
              fieldValue = '';
            }

            if (
              fieldValidations[templateField.template_datum_field_name] &&
              templateField.template_datum_field_name.toLowerCase() !== 'company id'
            ) {
              fieldValidations[templateField.template_datum_field_name].validations.forEach((validation) => {
                if (validation(fieldValue) === false) {
                  validField = false;
                  errorMessages.push([20, fieldValidations[templateField.template_datum_field_name].text]);
                }
              });
            } else if (
              fieldValidations[templateField.template_datum_field_name] &&
              templateField.template_datum_field_name.toLowerCase() === 'company id'
            ) {
              fieldValidations[templateField.template_datum_field_name].validations.forEach((validation) => {
                if (validation(fieldValue, this.props.activeTemplate) === false) {
                  validField = false;
                  errorMessages.push([20, fieldValidations[templateField.template_datum_field_name].text]);
                }
              });
            }

            if (validField) {
              if (
                !templateField.template_datum_field_description &&
                templateField.template_datum_mandatory === true &&
                !fieldValue
              ) {
                errorMessages.push([20, `${templateField.template_datum_field_name} is a mandatory field.`]);
              }
              properties[templateField.template_datum_field_name] = fieldValue;
            }
          } else {
            let valueFromState;
            let distance;

            switch (templateField.template_datum_field_name) {
              case 'Country':
                valueFromState = this.state.country;
                break;
              case 'State':
                valueFromState = this.state.state;
                break;
              case 'Sub State':
                valueFromState = this.state.substate;
                break;
              case 'Wind Barrier':
                valueFromState = this.state.windBarriers;
                break;
              case 'Riparian Buffers':
                valueFromState = this.state.riparian;
                break;
              case 'Buffer Zones':
                valueFromState = this.state.bufferZones;
                break;
              case 'Investment Name':
                valueFromState = this.state.locationName;
                if (!valueFromState) {
                  errorMessages.push([3, 'You must enter an investment name.']);
                }
                break;
              case 'Size of Investment':
                valueFromState = this.state.investmentSize;
                if (isNaN(parseInt(valueFromState)) && valueFromState !== null) {
                  errorMessages.push([29, 'Your size of investment is not an integer.']);
                }
                break;
              case 'CCY':
                valueFromState = this.state.investmentCurrency;
                break;
              case 'Start Date':
                const startDateValidation = this.validateStartDate();
                valueFromState = startDateValidation.startDate;
                startDateValidation.errorMessages.forEach((e) => {
                  errorMessages.push(e);
                });
                break;
              case 'End Date':
                const endDateValidation = this.validateEndDate();
                valueFromState = endDateValidation.endDate;
                endDateValidation.errorMessages.forEach((e) => {
                  errorMessages.push(e);
                });
                break;
              case 'Time Horizon':
                valueFromState = this.state.timeframe === 'Time Horizon' ? '' : this.state.timeframe;
                break;
              case 'Analysis Area':
                valueFromState = parseFloat(this.state.calculatedArea);
                break;
              case 'Analysis Radius':
                if (this.state.areaAround === 'small-area') {
                  distance = 1.78;
                } else if (this.state.areaAround === 'medium-area') {
                  distance = 3.99;
                } else if (this.state.areaAround === 'large-area') {
                  distance = 7.98;
                } else {
                  distance = parseFloat(this.state.customArea);
                }
                valueFromState = distance;
                break;
              case 'gadmid':
                valueFromState = this.state.gadmid;
                break;
              default:
                break;
            }
            properties[templateField.template_datum_field_name] = valueFromState;
          }
        });

        templateId = this.state.investmentTemplates[0].template_id;
      }

      const geom =
        this.state.geometry.centroid || (!this.state.geometry.latitude && this.state.geometry.rings)
          ? this.state.geometry
          : new Point({
              latitude: this.state.geometry.latitude,
              longitude: this.state.geometry.longitude,
              spatialReference: { wkid: 4326 },
            });

      if (geom.latitude) {
        properties.Latitude = geom.latitude;
      } else if (geom.centroid) {
        properties.Latitude = this.state.geometry.centroid.latitude;
      } else {
        errorMessages.push([1, 'You must create a proper geometry latitude']);
      }
      if (geom.longitude) {
        properties.Longitude = geom.longitude;
      } else if (geom.centroid) {
        properties.Longitude = geom.centroid.longitude;
      } else {
        errorMessages.push([2, 'You must create a proper geometry longitude']);
      }

      const geojsonGeom = geojsonUtil.arcgisToGeoJSON(geom);

      // Necessary to please the server's checks (this is no longer a field we use)
      properties['Accuracy Rating of Location Entered'] = 3;
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties,
            geometry: geojsonGeom,
          },
        ],
      };

      if (errorTitle && errorMessages.length > 0) {
        const errorMessagesMap = errorMessages
          .sort((a, b) => {
            if (a[0] === b[0]) {
              return 0;
            }
            return a[0] < b[0] ? -1 : 1;
          })
          .map((v) => v[1]);
        this.setState({
          isLoading: false,
          dialogOpen: true,
          dialogTitle: errorTitle,
          dialogMessage: errorMessagesMap,
        });
        return;
      }

      this.setState({
        isLoading: true,
      });

      httpRequest
        .fetchJSON('/locations/gadm', { geojson })
        .then(async (response) => {
          const jsonResponse = JSON.parse(response);
          const updatedGeoJSON = jsonResponse.geojson;

          if (updatedGeoJSON.features.length === 0) {
            this.setState({
              isLoading: false,
              dialogOpen: true,
              dialogTitle: 'Upload error occurred',
              dialogMessage: [
                'One or more of your locations failed to upload. Please follow the steps below:',
                '1. Please re-upload your locations, and on Step 3, search for "none" entries in the country, state, or sub-state fields. “None” entries occur when GFW Pro cannot identify a country, state, and sub-state for your uploaded locations.',
                '2. Check the following potential causes:',
                '• One or more of the failed locations may be on water. Please remove or correct those locations re-upload your list.',
                '• If the issue above has been addressed, and your locations are on land, a system interruption may have occurred. Please re-upload your list.',
              ],
              dialogEmail: true,
            });
            return;
          }

          const request = new XMLHttpRequest();
          request.onload = () => {
            if (
              request.responseText === saveListConfig.success ||
              request.responseText === saveAsDraftListConfig.success ||
              request.responseText === appendListConfig.success ||
              request.responseText === locationsPage.lists.copyMoveMessages.LocationsCopied.responseText
            ) {
              this.props.templateData.forEach((template) => {
                if (template.template_datum_field_value) {
                  delete template.template_datum_field_value;
                }
              });

              store.dispatch(changeAddType(this.props.addType === 'commodity' ? 'investment' : 'commodity'));
              const newState = { ...originalState };
              newState.isLoading = false;
              newState.dialogOpen = true;

              if (request.responseText === saveAsDraftListConfig.success) {
                newState.dialogTitle = getDialogTitle(saveListConfig.success);
                newState.dialogMessage = getDialogContent(saveListConfig.success, listName, true);
              } else if (
                request.responseText === saveListConfig.success ||
                request.responseText === appendListConfig.success ||
                request.responseText === copyListConfig.success
              ) {
                newState.dialogTitle = getDialogTitle(request.responseText);
                newState.dialogMessage = getDialogContent(request.responseText, listName, isSaveAsDraft);
              }

              this.setState(newState);
            } else {
              this.setState({
                isLoading: false,
                dialogOpen: true,
                dialogTitle: 'Location Not Added',
                dialogMessage:
                  'Please review these location/s, to ensure the are not the same as existing location/s in GFW Pro, and try again.',
              });
            }
          };

          request.onerror = (err) => {
            this.setState({
              isLoading: false,
              dialogOpen: true,
              dialogTitle: 'Location Not Added',
              dialogMessage:
                'Please review these location/s, to ensure the are not the same as existing location/s in GFW Pro, and try again.',
            });
            console.log(`Error: ${err}`);
          };

          let bigObj;
          if (this.state.selectedList === 'Create New List') {
            bigObj = {
              list_name: listName,
              template_id: templateId,
              commodity:
                this.state.chosenCommodity && this.state.chosenCommodity.hasOwnProperty('label')
                  ? this.state.chosenCommodity.label
                  : null,
              geojson: updatedGeoJSON,
              custom_attributes: customAttributes,
              location_classification: this.state.selectedLocationClassification,
              gfw_list_id: this.props.adminArea.gfwListID,
              list_status_id: getListStatusId(isSaveAsDraft),
            };

            request.open('POST', isSaveAsDraft ? saveAsDraftListConfig.route : '/locations/addToNewList', true);

            if (isSaveAsDraft) {
              ga('send', 'event', 'Submit', 'Upload List', 'User uploads a list with single location as a draft');
            } else {
              ga('send', 'event', 'Submit', 'Upload List', 'User uploads a list with single location and submits');
            }

            ga(
              'send',
              'event',
              'Locations Click',
              isSaveAsDraft ? 'add locations save button clicked' : 'add locations save as draft button clicked',
              isSaveAsDraft
                ? `user created a list with a newly added ${this.props.addType} location with a commodity type of ${this.props.activeTemplate}`
                : `user created as draft a list with a newly added ${this.props.addType} location with a commodity type of ${this.props.activeTemplate}`
            );
          } else {
            const activeList = this.props.userLists.filter((list) => {
              return list.list_name === listName;
            });

            if (activeList[0].list_locations_count === 1500) {
              this.setState({
                isLoading: false,
                dialogOpen: true,
                dialogTitle: 'List exceeds maximum allowable size',
                dialogMessage:
                  'Lists are limited to a maximum of 1,500 locations. Please cancel this edit and ensure your final list will contain no more than 1,500 locations.',
              });
              return;
            }
            if (window.mapData) {
              await httpRequest.fetchJSON('/locations/lockList', { list_id: window.mapData.listID });

              bigObj = {
                src_list_id: window.mapData.listID,
                src_location_ids: [window.mapData.locationID],
                dest_list_id: activeList[0].id,
                geojson: updatedGeoJSON,
                gfw_list_id: 0,
                list_status_id: getListStatusId(isSaveAsDraft),
              };
              request.open('POST', '/locations/copyLocations', true);
            } else {
              bigObj = {
                list_id: activeList[0].id,
                table_name: activeList[0].list_name,
                geojson: updatedGeoJSON,
                appendLocations: true,
                list_analysis_table_name: activeList[0].list_analysis_table_name,
                list_status_id: getListStatusId(isSaveAsDraft),
              };
              request.open('POST', '/locations/updateExistingList', true);
              if (isSaveAsDraft) {
                ga('send', 'event', 'Submit', 'Upload List', 'User uploads a list with single location as a draft');
              } else {
                ga('send', 'event', 'Submit', 'Upload List', 'User uploads a list with single location and submits');
              }

              ga(
                'send',
                'event',
                'Locations Click',
                'add locations save button clicked',
                `user added ${this.props.addType} location to an existing list with a commodity type of ${this.props.activeTemplate}`
              );

              this.setState({ saved: true });
            }
          }

          request.setRequestHeader('Content-Type', 'application/json');
          console.log('update/create list', bigObj);
          request.send(JSON.stringify(bigObj));
        })
        .catch((err) => {
          console.log('errr', err);
          this.setState({
            isLoading: false,
            dialogOpen: true,
            dialogTitle: 'Clip-to-land Error',
            dialogMessage: 'These features could not be modified. Upload has failed.',
          });
        });
    }
  };

  updateLocationName = (evt) => {
    const value = evt.target ? evt.target.value : evt.value;
    this.setState({
      locationName: value,
      saved: false,
    });
  };

  changeMethod = (evt) => {
    store.dispatch(changeAddMethod(evt.target.id));
  };

  populateMethodOptions = (options) => {
    const filteredOptions = options.filter((option) => option.type === this.props.addType || option.type === 'both');
    const actionItems = filteredOptions
      .sort((a, b) => (a.investmentOrder > b.investmentOrder ? 1 : b.investmentOrder > a.investmentOrder ? -1 : 0))
      .map((option, k) => {
        return (
          <div
            key={k}
            className={`add-location-method__tab ${this.props.addMethod === option.id ? 'selected-method' : ''}`}
          >
            <input
              type="radio"
              id={option.id}
              name={option.id}
              value={option.id}
              onChange={this.changeMethod}
              checked={this.props.addMethod === option.id}
            />
            <label htmlFor={option.id} className="add-location-method__label">
              {option.landingLabel}
            </label>
          </div>
        );
      });
    return actionItems;
  };

  deduceAdmin = () => {
    const serviceURL = getGadmService();
    const queryProperties = {
      geometry: this.state.deduceAdminGeometry.centroid
        ? this.state.deduceAdminGeometry.centroid
        : this.state.deduceAdminGeometry,
      returnGeometry: false,
      outFields: ['name_0', 'name_1', 'name_2', 'gadmid'],
    };
    esriQuery(serviceURL, queryProperties)
      .then((response) => {
        if (response.features && response.features.length > 0) {
          this.setState({
            substate: response.features[0].attributes.name_2,
            state: response.features[0].attributes.name_1,
            country: response.features[0].attributes.name_0,
            gadmid: response.features[0].attributes.gadmid,
            saved: false,
          });
        } else {
          this.setState({
            substate: '',
            state: '',
            country: '',
            gadmid: '',
            saved: false,
          });
        }
      })
      .catch((err) => {
        console.log('Error', err);
        this.setState({
          substate: '',
          state: '',
          country: '',
          gadmid: '',
          saved: false,
        });
      });
  };

  setAdditional = (additional) => {
    this.setState({
      windBarriers: additional.windBarriers,
      riparian: additional.riparian,
      bufferZones: additional.bufferZones,
    });
  };

  updateList = (val) => {
    this.setState({
      selectedList: val,
      saved: false,
    });
  };

  updateCustomList = (evt) => {
    this.setState({
      customList: evt.target.value,
      saved: false,
    });
  };

  updateInvestmentCurrency = (val) => {
    this.setState({
      investmentCurrency: val.value,
      saved: false,
    });
  };

  updateInvestmentSize = (evt) => {
    const { value } = evt.target;
    // investmentSize is int type in the DB so we can not pass an empty sring
    // we need to pass null if the user types something then deletes it all
    this.setState({
      investmentSize: value === '' ? null : value,
      saved: false,
    });
  };

  generateMessages = (message, i) => {
    return <p key={message + i}>{message}</p>;
  };

  shouldCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  shouldRefresh = () => {
    window.location = '/locations';
  };

  formatDate = (date) => {
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
  };

  setDialog = (dialogState) => {
    this.setState(dialogState);
  };

  clearDropdown = (evt, template) => {
    const newTemplates = [];
    this.state.investmentTemplates.forEach((stateTemplate) => {
      if (
        template.template_id === stateTemplate.template_id &&
        template.template_datum_field_name === stateTemplate.template_datum_field_name
      ) {
        delete template.template_datum_field_value; // this brings back our label of 'Select..' by default!
        newTemplates.push(template);
      } else {
        newTemplates.push(stateTemplate);
      }
    });

    this.props.templateData.forEach((templateDataTemp) => {
      if (
        template.template_id === templateDataTemp.template_id &&
        template.template_datum_field_name === templateDataTemp.template_datum_field_name
      ) {
        delete templateDataTemp.template_datum_field_value;
      }
    });

    this.setState({
      investmentTemplates: newTemplates,
      saved: false,
    });
  };

  clearCurrencyDropdown = () => {
    this.setState({
      investmentCurrency: 'USD',
    });
  };

  clearTimeframeDropdown = () => {
    this.setState({
      startDate: null,
      endDate: null,
      timeframe: '',
    });
  };

  clearAddToListDropdown = () => {
    this.setState({
      selectedList: 'Create New List',
    });
  };

  generateEmailText = () => {
    return (
      <p>
        If your issues continue, please email{' '}
        <a className="module-email-link" href="mailto:GFWPROsupport@wri.org">
          GFWPROsupport@wri.org
        </a>
      </p>
    );
  };

  selectTemplate = (id) => {
    if (this.props.resetLocationClassification) {
      this.props.resetLocationClassification();
    }
    store.dispatch(changeTemplate(id));
  };

  saveSuccess = () => {
    this.shouldRefresh();
  };

  render() {
    const defaultAction =
      this.state.dialogTitle === 'Location Added' ||
      this.state.dialogTitle === 'Location Appended!' ||
      this.state.dialogTitle === saveListConfig.UploadLocationsSingleNewList.dialogTitle ||
      this.state.dialogTitle === saveAsDraftListConfig.UploadLocationsSingleNewList.dialogTitle ||
      this.state.dialogTitle === locationsPage.lists.copyMoveMessages.LocationsCopied.title ||
      this.state.dialogTitle === DIALOG__SUBMIT_TITLE
        ? [
            <Button
              variant="primary"
              label="OK"
              keyboardFocused
              onClick={this.state.overrideOnClose ? this.discardItem : this.saveSuccess}
            />,
          ]
        : [<Button variant="primary" label="OK" keyboardFocused onClick={this.shouldCloseDialog} />];
    const saveActions = [
      <div className="dialog__footer">
        <Button
          variant="primary"
          className="add-location-dialog-action"
          label={locationsPage.lists.ok}
          onClick={this.saveItem}
        />
        <LinkButton className="add-location-dialog-action" label="Cancel" onClick={this.shouldCloseDialog} />
      </div>,
    ];

    const commodityTemplate = this.props.templateData.filter((template) => template.location_type_name === 'Commodity');
    const methods = this.populateMethodOptions(locationsPage.landing.selectMethodOptions);
    const {
      substate,
      state,
      country,
      areaAround,
      customArea,
      calculatedArea,
      dialogOpen,
      dialogTitle,
      dialogMessage,
      dialogEmail,
      selectedList,
      locationName,
      startDate,
      endDate,
      geometry,
      lat,
      lng,
      commodityTemplates,
      timeframe,
      investmentCurrency,
      investmentSize,
      customList,
      measurementUnit,
      selectedLocationClassification,
      isLoading,
    } = this.state;
    const { view, addMethod, addType, locationType, activeTemplate, userLists, templateDropdowns } = this.props;
    let listPlaceholderValue =
      activeTemplate === 'investment' && customList === 'investment' && addType === 'commodity'
        ? 'Recent Other'
        : customList;

    if (listPlaceholderValue === 'other') {
      listPlaceholderValue = 'Recent Other';
    }

    const dropdownOptionsInvestmentCommodity = buildDropdownOptions(locationsPage.add.dropdownOptions);
    const dialogContent =
      typeof dialogMessage === 'string' ? [dialogMessage] : dialogMessage.map(this.generateMessages);
    const investmentTemplateTypes = this.state.investmentTemplates.filter((t) => t.id == 6)[0];
    const hasGeometry = geometry && geometry.type;

    if (dialogEmail) {
      dialogContent.push(this.generateEmailText());
    }

    return (
      <div className={`add-single-location locations-body ${view === 'add' ? '' : 'hidden'}`}>
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={dialogTitle === DIALOG__SUBMIT_TITLE && dialogOpen ? saveActions : defaultAction}
          onRequestClose={this.shouldCloseDialog}
        >
          {dialogContent}
        </Dialog>
        <ModalLoader open={isLoading} />
        <div className="add-single-location__header">
          <h1 className="add-single-location__title">{locationsPage.add.title}</h1>
        </div>

        <AddLocationCard>
          <h2 className="add-location-card__title">Type</h2>
          <div className="commodity-option__container">
            {/* INVESTMENT CHOICE */}
            <div>
              <input
                type="radio"
                id="location-type-selection_investment"
                name="location-type"
                value="investment"
                checked={this.props.addType === 'investment'}
                onChange={(e) => {
                  store.dispatch(changeAddType('investment'));
                  this.setState({ customList: 'investment' });
                }}
              />
              <label htmlFor="location-type-selection_investment" className="locations-select-type-label">
                {locationsPage.landing.investment}
              </label>
              <p className="locations-upload-step__option-description">
                {locationsPage.upload.investmentAddTypeDescription}
              </p>
              {this.props.addType === 'investment' ? (
                this.props.templateData
                  .filter((t) => t.location_type_name === 'Investment')
                  .map((t, i) => {
                    <p key="{i}">{t.location_type_name}</p>;
                  })
              ) : (
                <></>
              )}
            </div>

            {this.props.addType === 'investment' ? (
              <div className="locations-upload-step__suboptions">
                <div className="locations-upload-step__suboptions-description">
                  {locationsPage.upload.investmentAddType}
                </div>
                <div className="locations-upload-step__suboptions-container">
                  {investmentTemplateTypes.template_datum_field_description
                    .split(',')
                    .map((t) => t.trim())
                    .map((commodityType) => {
                      return (
                        <div key={`${commodityType}_investment-option`} className="commodity-option__container">
                          <input
                            type="radio"
                            id={`investment-type-selection-${commodityType}`}
                            name="chosen-investment"
                            value={commodityType}
                            checked={this.state.chosenInvestment === commodityType}
                            onChange={() => {
                              this.editInvestmentTemplates({ value: commodityType }, investmentTemplateTypes);
                              this.setState({ chosenInvestment: commodityType });
                            }}
                          />
                          <label htmlFor={`investment-type-selection-${commodityType}`}>{commodityType}</label>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <></>
            )}

            {/* COMMODITY CHOICE */}
            <input
              type="radio"
              id="location-type-selection_commodity"
              className="commodity-option"
              name="location-type"
              value="commodity"
              checked={this.props.addType === 'commodity'}
              onChange={(e) => {
                store.dispatch(changeAddType('commodity'));
                this.setState({ customList: 'commodity' });
              }}
            />
            <label htmlFor="location-type-selection_commodity" className="commodity-option-label">
              {locationsPage.landing.commodity}
            </label>
            <p className="locations-upload-step__option-description">
              {locationsPage.upload.commodityAddTypeDescription}
            </p>
            {this.props.addType === 'commodity' ? (
              this.props.templateData
                .filter((t) => t.location_type_name === 'Commodity')
                .map((t, i) => {
                  <p key={i}>{t.location_type_name}</p>;
                })
            ) : (
              <></>
            )}
          </div>
          {this.props.addType === 'commodity' ? (
            <div className="locations-upload-step__suboptions">
              <div className="locations-upload-step__suboptions-description">
                {locationsPage.upload.commodityAddType}
              </div>
              <div className="locations-upload-step__suboptions-container">
                {Object.values(locationsPage.upload.templateOptions).map((template) => {
                  return (
                    <div key={`${template.id}_commodity-option`} className="commodity-option__container">
                      <input
                        type="radio"
                        id={`commodity-type-selection-${template.id}`}
                        name="chosen-commodity"
                        value={template.id}
                        checked={
                          this.state.chosenCommodity &&
                          (this.state.chosenCommodity.hasOwnProperty('id')
                            ? this.state.chosenCommodity.id
                            : this.state.chosenCommodity) === template.id
                        }
                        onChange={() => {
                          this.updateTemplateRadioSelection(template);
                        }}
                      />
                      <label htmlFor={`commodity-type-selection-${template.id}`}>{template.label}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <></>
          )}
        </AddLocationCard>

        <AddLocationCard>
          <h2 className="add-location-card__title">General Information</h2>
          <label htmlFor="location-name" className="block-label">
            {addType === 'investment' ? locationsPage.add.investmentName : locationsPage.add.commodityName}
          </label>
          <input
            id="location-name"
            value={locationName}
            onChange={this.updateLocationName}
            className="locations-adding-name"
          />

          <AddList
            commodityTemplates={commodityTemplate}
            addType={addType}
            updateList={this.updateList}
            userLists={userLists}
            activeTemplate={activeTemplate}
            selectedList={selectedList}
            selectedLocationClassification={selectedLocationClassification}
            clearAddToListDropdown={this.clearAddToListDropdown}
            listPlaceholderValue={listPlaceholderValue}
            updateCustomList={this.updateCustomList}
          />

          <DescribeLocation
            activeTemplate={activeTemplate}
            addMethod={addMethod}
            addType={addType}
            clearDropdown={this.clearDropdown}
            contentEditable
            editTemplate={this.editCommodityTemplates}
            locationType={locationType}
            resetLocationClassification={this.resetLocationClassification}
            required
            templateData={commodityTemplates}
            templateDropdowns={templateDropdowns}
          />
        </AddLocationCard>

        <AddLocationCard>
          <h2 className="add-location-card__title">{locationsPage.add.define}</h2>
          <section className="add-location-method">{methods}</section>

          <section className="add-location-card__content">
            <div className="location-selected-option__view">
              {addMethod === 'byUpload' ? (
                <Upload
                  setDialog={this.setDialog}
                  activeTemplate={activeTemplate}
                  substate={substate}
                  state={state}
                  country={country}
                  setAdditional={this.setAdditional}
                  setGeometry={this.setGeometry}
                  addMethod={addMethod}
                />
              ) : addMethod === 'byDrawing' ? (
                <DrawShape
                  geomFromMap={
                    this.props.geomFromMap && this.props.geomFromMap.geometry
                      ? this.props.geomFromMap.geometry
                      : this.props.geomFromMap
                  }
                  setGeometry={this.setGeometry}
                />
              ) : addMethod === 'byAddress' ? (
                <SelectAddress
                  measurementUnit={measurementUnit}
                  setMeaurementUnit={this.setMeaurementUnit}
                  setArea={this.setArea}
                  areaAround={areaAround}
                  customArea={customArea}
                  calculatedArea={calculatedArea}
                  substate={substate}
                  state={state}
                  country={country}
                  setGeometry={this.setGeometry}
                  addMethod={addMethod}
                  hasGeometry={hasGeometry}
                />
              ) : addMethod === 'byCoordinates' ? (
                <SearchCoordinates
                  lat={lat}
                  lng={lng}
                  setLat={this.setLat}
                  setLng={this.setLng}
                  measurementUnit={measurementUnit}
                  setMeaurementUnit={this.setMeaurementUnit}
                  setArea={this.setArea}
                  areaAround={areaAround}
                  customArea={customArea}
                  calculatedArea={calculatedArea}
                  substate={substate}
                  state={state}
                  country={country}
                  setGeometry={this.setGeometry}
                  addMethod={addMethod}
                  hasGeometry={hasGeometry}
                />
              ) : (
                <></>
              )}
            </div>
          </section>
        </AddLocationCard>

        <AddLocationCard>
          <h2 className="add-location-card__title">
            {locationsPage.add.timeframe}
            <span className="add-location-card__optional-indicator">{locationsPage.add.optional}</span>
          </h2>
          <p className="add-location-card__prompt">{locationsPage.add.timeframeDesc}</p>
          <div className="add-location-card__radio-group">
            {locationsPage.add.timeHorizonOptions.map((option, i) => {
              return this.createTimeframeRadio(option.label, option.id, i);
            })}
          </div>

          {timeframe === 'Time Horizon' && (
            <div className="location-date-input__container">
              <div className="location-date-input__start-container">
                <label className="label-block">{locationsPage.add.startDate}</label>
                <MuiThemeProvider muiTheme={muiTheme}>
                  <DatePicker
                    hintText="mm/dd/yyyy"
                    className="locations-timeframe-start gfw-datepicker"
                    value={startDate}
                    onChange={this.updateStartDate}
                    formatDate={this.formatDate}
                  />
                </MuiThemeProvider>
              </div>
              <div className="location-date-input__end-container">
                <label className="label-block">{locationsPage.add.endDate}</label>
                <MuiThemeProvider muiTheme={muiTheme}>
                  <DatePicker
                    hintText="mm/dd/yyyy"
                    className="locations-timeframe-end gfw-datepicker"
                    value={endDate}
                    onChange={this.updateEndDate}
                    formatDate={this.formatDate}
                  />
                </MuiThemeProvider>
              </div>
            </div>
          )}
        </AddLocationCard>

        {this.props.addType === 'commodity' ? (
          <AddLocationCard>
            <h2 className="add-location-card__title">
              {locationsPage.add.additionalMetadata}
              <span className="add-location-card__optional-indicator">{locationsPage.add.optional}</span>
            </h2>
            <DescribeLocation
              activeTemplate={activeTemplate}
              addMethod={addMethod}
              addType={addType}
              clearDropdown={this.clearDropdown}
              contentEditable
              editTemplate={this.editCommodityTemplates}
              locationType={locationType}
              resetLocationClassification={this.resetLocationClassification}
              required={false}
              templateDropdowns={templateDropdowns}
              templateData={commodityTemplates}
            />
          </AddLocationCard>
        ) : (
          <></>
        )}

        {this.props.addType === 'investment' ? (
          <AddLocationCard>
            <h2 className="add-location-card__title">
              {locationsPage.add.additionalMetadata}
              <span className="add-location-card__optional-indicator">{locationsPage.add.optional}</span>
            </h2>
            <DescribeInvestment
              addType={addType}
              locationType={locationType}
              templateDropdowns={templateDropdowns}
              currency={investmentCurrency}
              // value for controlled component should not be null, but we need to pass null to the DB
              // so if it's null, send an empty string
              size={investmentSize === null ? '' : investmentSize}
              editTemplate={this.editInvestmentTemplates}
              templateData={this.state.investmentTemplates}
              contentEditable
              updateInvestmentCurrency={this.updateInvestmentCurrency}
              updateInvestmentSize={this.updateInvestmentSize}
              clearDropdown={this.clearDropdown}
              clearCurrencyDropdown={this.clearCurrencyDropdown}
              adminData={this.props.adminArea.adminData}
            />
          </AddLocationCard>
        ) : (
          <></>
        )}

        <SaveAsDraftNote />

        <section className="add-single-location__footer">
          <div className="add-single-location__action-buttons">
            <SaveAsDraftButtonWithDialog saveLocations={() => this.saveItem({ isSaveAsDraft: true })} />
            <Button onClick={this.saveAndAddAnother} label={locationsPage.add.submit} variant="primary" />
          </div>
          <LinkButton onClick={this.cancelAdd} label={locationsPage.add.cancel} />
        </section>
      </div>
    );
  }
}
