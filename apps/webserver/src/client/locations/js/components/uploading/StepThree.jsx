/* eslint-disable camelcase */
/* eslint-disable global-require */
/* eslint-disable guard-for-in */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-loop-func */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import React, { Component } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Dialog from 'material-ui/Dialog';
import _every from 'lodash/every';
import _maxBy from 'lodash/maxBy';
import moment from 'moment';

import { fieldValidations } from '../../utils/validations';
import { locationsPage, convertURL } from '../../../../common/js/config';
import downloaders from '../../../../common/js/utils/downloaders';
import esriConfig from 'esri/config';
import Polygon from 'esri/geometry/Polygon';
import Point from 'esri/geometry/Point';
import GeometryEngine from 'esri/geometry/geometryEngine';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';
import {
  discernProjection,
  maxFileSizeBytes,
  maxFileSizeMB,
  maxLocations,
} from '../../utils/upload.utils';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import FileDrop from './FileDrop';
import Banner from '../../../../common/js/components/Banners/Banner';
import Button from '../../../../common/js/components/Button';
import IconBadgeCheck from '../../../../common/js/components/icon/IconBadgeCheck';
import IconExclamationTriangle from '../../../../common/js/components/icon/IconExclamationTriangle';
import InlineLoader from '../../../../common/js/components/Loaders/InlineLoader';

import { parse, load } from '@loaders.gl/core';
import { ZipLoader } from '@loaders.gl/zip';
import { KMLLoader } from '@loaders.gl/kml';

import SpatialReference from 'esri/geometry/SpatialReference';
import MultiGridTable from '../edit/table/MultiGridTable';
// eslint-disable-next-line camelcase
import { _getFeatures, prepUploadFeatures_AddLocationID } from '../edit/table/MultiGridTable.util';
import { messageIncorrectFileTypeUpload } from './Uploading.config';

import {
  excelLocationClassificationExcluded,
  excelLocationClassificationMandatory,
} from '../../../../common/js/config';

/**
 * Get Template Headers list
 * @param {String} addType - List type
 * @param {String} commodityType - Commodity Type
 * @param {String} activeTemplate - Active Template
 * @param {List} templateData - Templates Data
 * @return {[]} - List of template headers
 */
const getTemplateHeadersList = ({ addType, commodityType, activeTemplate, templateData }) => {
  let active = activeTemplate;
  if (addType === 'commodity' && active === 'investment') {
    if (commodityType === 'palmOil') {
      active = 'palmGeneric';
    } else if (commodityType === 'soy') {
      active = 'soyGeneric';
    } else if (commodityType === 'cattle') {
      active = 'cattleGeneric';
    } else if (commodityType === 'cocoa') {
      active = 'cocoaGeneric';
    }
  }

  const [matchingTemplate] = locationsPage.tableKeyArray.filter((object) => {
    return object.activeTemplate === active;
  });

  return templateData
    .filter((template) => template.template_name === matchingTemplate.templateDataValue)
    .map((filteredTemplate) => filteredTemplate.template_datum_field_name);
};

/**
 * Find More Similar header from filtered headers
 * @param {String} header - Header to match against
 * @param {[]} headerMatches - List of filtered headers
 * @return {String} - Return closer string
 */
const findMoreSimilarHeader = (header, headerMatches) => {
  const keysWeight = headerMatches.map((key) => {
    let equivalency = 0;
    const minLength = header.length > key.length ? key.length : header.length;
    const maxLength = header.length < key.length ? key.length : header.length;

    for (let i = 0; i < minLength; i += 1) {
      if (header[i] === key[i]) {
        equivalency += 1;
      }
    }

    const weight = equivalency / maxLength;
    return { key, weight };
  });

  return _maxBy(keysWeight, 'weight').key;
};

/**
 * Get Header Mapping of all Template headers and feature properties
 * @param {[]} templateHeadersList - Template Headers List
 * @param {[]} propertiesKeys - Features Properties keys List
 * @return {{}} - Hash of template Headers and uploaded features properties keys
 */
const getHeaderMapping = (templateHeadersList, propertiesKeys) => {
  const shortHeaderMapping = {};

  templateHeadersList.forEach((header) => {
    const headerMatches = propertiesKeys.filter((key) => {
      const keyNoUnderscores = key.replaceAll('_', ' ');
      const regExp = new RegExp(keyNoUnderscores, 'i');
      const match = header.match(regExp);
      return match;
    });
    shortHeaderMapping[header] =
      headerMatches.length > 1 ? findMoreSimilarHeader(header, headerMatches) : headerMatches[0];
  });

  return shortHeaderMapping;
};

/**
 * Process KML Description and attaching to feature properties
 * @param {Object} feat - Feature object
 */
const processKmlDescription = (feat) => {
  const { properties } = feat;

  const descriptionWithoutHtml = properties.description
    .replaceAll('</td><td>', ',')
    .replace(/<[^>]*>/g, '')
    .trim();

  Papa.parse(descriptionWithoutHtml).data.forEach((item) => {
    const [key, value] = item;
    properties[key.trim()] = value;
  });
};

export default class StepThree extends Component {
  constructor(props) {
    const { templateData } = props;
    super(props);

    const integers = [];
    const floats = [];
    templateData.forEach((template) => {
      if (template.template_datum_type_id === 2) {
        integers.push(template.template_datum_field_name);
      } else if (template.template_datum_type_id === 3) {
        floats.push(template.template_datum_field_name);
      }
    });

    this.state = {
      integers,
      floats,
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      inputKey: 0,
      showValidated: 'all',
      totalFeatures: 0,
    };

    esriConfig.request.corsEnabledServers.push(convertURL);
    esriConfig.request.corsEnabledServers.push('production-api.globalforestwatch.org');

    require(['esri/geometry/support/webMercatorUtils'], (webMercatorUtils) => {
      // eslint-disable-next-line react/no-unused-class-component-methods
      this.WebMercatorUtils = webMercatorUtils;
    });

    require(['esri/geometry/projection'], (projection) => {
      projection.load().then(() => {
        this.projection = projection;
      });
    });
  }

  shouldCloseDialog = () => {
    let { inputKey } = this.state;
    inputKey += 1;
    this.setState({
      dialogOpen: false,
      inputKey,
    });
  };

  generateMessages = (message, i) => {
    const newLocal = message + i;
    return <p key={newLocal}>{message}</p>;
  };

  isValidRow = (feature) => {
    const { addType } = this.props;

    let isValid = false;
    let hasData = false;
    if (addType === 'commodity') {
      if (feature['Location Name'] && typeof feature['Location Name'] === 'number') {
        feature['Location Name'] = feature['Location Name'].toString();
      }
      if (
        feature['Location Name'] &&
        feature['Location Name'].trim() !== 'Mandatory' &&
        feature['Location Name'] !== 'String' &&
        feature['Location Name'] !== 'POPULATE WITH DATA BELOW THIS LINE' &&
        !feature['Location Name'].toLowerCase().startsWith('name of the') &&
        !feature['Location Name'].startsWith('Mill Name') &&
        !feature['Location Name'].startsWith('cocoa farm name')
      ) {
        isValid = true;
      } else if (feature['Location Name'] === '') {
        isValid = true;
      }
    } else if (addType === 'investment') {
      if (feature['Investment Name'] && typeof feature['Investment Name'] === 'number') {
        feature['Investment Name'] = feature['Investment Name'].toString();
      }
      if (
        feature['Investment Name'] &&
        feature['Investment Name'] !== 'Mandatory' &&
        feature['Investment Name'] !== 'String' &&
        feature['Investment Name'] !== 'POPULATE WITH DATA BELOW THIS LINE' &&
        !feature['Investment Name'].startsWith('Name associated')
      ) {
        isValid = true;
      } else if (feature['Investment Name'] === '') {
        isValid = true;
      }
    }

    // if every column is empty, ignore this row!
    Object.keys(feature).forEach((key) => {
      if (feature[key] && feature[key] !== '') {
        hasData = true;
      }
    });
    if (!hasData) {
      isValid = false;
    }

    return isValid;
  };

  returnLatLong = (feat, val) => {
    let latLngValue;
    if (feat.geometry.centroid) {
      latLngValue = feat.geometry.centroid[val.toLowerCase()];
    } else if (feat.geometry.coordinates && typeof feat.geometry.coordinates[0] === 'number') {
      latLngValue =
        val === 'Latitude' ? feat.geometry.coordinates[1] : feat.geometry.coordinates[0];
    } else {
      latLngValue = 0;
    }
    return latLngValue;
  };

  complete = (results) => {
    const {
      activeTemplate,
      setUploading,
      addType,
      commodityType,
      templateData,
      accuracy,
      setFeatures,
    } = this.props;
    const { integers, floats } = this.state;
    let headerKey;
    let active = activeTemplate;

    if (results && results.data && results.data.length > 1501) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'List exceeds maximum allowable size',
        dialogMessage: locationsPage.oversizedUploadText,
      });
      setUploading(false);
      return;
    }

    if (addType === 'commodity' && active === 'investment') {
      if (commodityType === 'palmOil') {
        active = 'palmGeneric';
      } else if (commodityType === 'soy') {
        active = 'soyGeneric';
      } else if (commodityType === 'cattle') {
        active = 'cattleGeneric';
      } else if (commodityType === 'cocoa') {
        active = 'cocoaGeneric';
      }
    }
    locationsPage.tableKeyArray.forEach((object) => {
      if (object.activeTemplate === activeTemplate) {
        headerKey = object.templateDataValue;
      }
    });
    const headerArray = [];
    templateData.forEach((data) => {
      if (data.template_name === headerKey) {
        if (
          activeTemplate !== 'palmMill' ||
          (data.template_datum_field_name !== 'Latitude' &&
            data.template_datum_field_name !== 'Longitude')
        ) {
          headerArray.push(data.template_datum_field_name);
        }
      }
    });

    let matchingTemplate = true;
    let wrongTemplateUploaded = false;
    const resultsKeys = Object.keys(results.data[0]);

    const missingHeaders = [];
    headerArray.forEach((header) => {
      if (
        resultsKeys.indexOf(header) === -1 &&
        locationsPage.upload.generatedHeaderFields.indexOf(header) === -1
      ) {
        missingHeaders.push(header);
        matchingTemplate = false;
        console.log(`Your data is missing a property: ${header} !`);
      }
      if (
        resultsKeys.indexOf('RSPO Model') > -1 &&
        (activeTemplate === 'soyGeneric' ||
          activeTemplate === 'cocoaGeneric' ||
          activeTemplate === 'cattleGeneric')
      ) {
        matchingTemplate = false;
        wrongTemplateUploaded = true;
      }
    });

    const templateErrorHeader = 'Incorrect template uploaded';
    const templateDescription = locationsPage.messageText[activeTemplate]
      ? locationsPage.messageText[activeTemplate].text
      : activeTemplate;

    if (matchingTemplate) {
      const submittedData = [];
      results.data.forEach((feature) => {
        resultsKeys.forEach((key, k) => {
          if (integers.indexOf(key) > -1) {
            if (
              (key === 'Analysis Area' && feature[key] !== '') ||
              (key === 'Analysis Radius' && feature[key] !== '')
            ) {
              feature[resultsKeys[k]] = parseInt(feature[key], 10)
                ? parseInt(feature[key], 10)
                : '';
            } else if (
              (key === 'Analysis Area' && feature[key] === '') ||
              (key === 'Analysis Radius' && feature[key] === '')
            ) {
              feature[resultsKeys[k]] = feature[key];
            } else {
              feature[resultsKeys[k]] = parseInt(feature[key], 10)
                ? parseInt(feature[key], 10)
                : '';
            }
          } else if (floats.indexOf(key) > -1) {
            if (
              (key === 'Analysis Area' && feature[key] !== '') ||
              (key === 'Analysis Radius' && feature[key] !== '')
            ) {
              feature[resultsKeys[k]] = parseFloat(feature[key]) ? parseFloat(feature[key]) : '';
            } else if (
              (key === 'Analysis Area' && feature[key] === '') ||
              (key === 'Analysis Radius' && feature[key] === '')
            ) {
              feature[resultsKeys[k]] = feature[key];
            } else {
              feature[resultsKeys[k]] = parseFloat(feature[key]) ? parseFloat(feature[key]) : '';
            }
          } else {
            feature[resultsKeys[k]] = feature[key] ? feature[key] : '';
          }
        });

        if (this.isValidRow(feature)) {
          if (!feature.Attribute1) {
            delete feature.Attribute1;
          }
          if (!feature.Attribute2) {
            delete feature.Attribute2;
          }
          if (!feature.Attribute3) {
            delete feature.Attribute3;
          }

          delete feature[''];
          submittedData.push(feature);
        }
        feature['Accuracy Rating of Location Entered'] = accuracy;
      });

      if (submittedData.length > 0) {
        submittedData.forEach((data) => {
          if (data['Start Date'] === null || !data['Start Date']) {
            data['Start Date'] = '';
          }
          if (data['End Date'] === null || !data['End Date']) {
            data['End Date'] = '';
          }
          return data;
        });
        console.log('parse csv complete', submittedData);
        this.setState({ totalFeatures: submittedData.length });
        setFeatures(submittedData);
      } else {
        let text = `The uploaded file format does not match the ${templateDescription} template type. Please make sure the template type selected in Pro matches the uploaded template type.`;
        if (missingHeaders.length > 0) {
          text += ` If the template type is correct, the following fields are missing: ${missingHeaders.join(
            ', '
          )}`;
        } else {
          text += ` Either your csv is empty, or you are missing a ${
            addType === 'commodity' ? 'Location Name' : 'Investment Name'
          } column.`;
        }
        setUploading(false);
        this.setState({
          dialogOpen: true,
          dialogTitle: templateErrorHeader,
          dialogMessage: text,
        });
      }
    } else if (wrongTemplateUploaded) {
      const text = `The uploaded file format does not match the ${templateDescription} template type. Please make sure the template type selected in Pro matches the uploaded template type.`;
      this.setState({
        dialogOpen: true,
        dialogTitle: templateErrorHeader,
        dialogMessage: text,
      });
      setUploading(false);
    } else {
      let text = `The uploaded file format does not match the ${templateDescription} template type. Please make sure the template type selected in Pro matches the uploaded template type.`;
      if (missingHeaders.length > 0) {
        text += ` If the template type is correct, the following fields are missing: ${missingHeaders.join(
          ', '
        )}`;
      }
      this.setState({
        dialogOpen: true,
        dialogTitle: templateErrorHeader,
        dialogMessage: text,
      });
      setUploading(false);
    }
  };

  error = (error, newFile) => {
    const { setUploading } = this.props;
    console.log('Parsing Error:', error, newFile);
    this.setState({
      dialogOpen: true,
      dialogTitle: 'Error',
      dialogMessage:
        'There was an error parsing your upload. Please make sure your file matches our specifications!',
    });

    setUploading(false);
    // eslint-disable-next-line react/no-string-refs
    this.refs.upload.setAttribute('value', '');
  };

  parseZip = (file) => {
    const {
      setUploading,
      activeTemplate,
      addType,
      commodityType,
      templateData,
      accuracy,
      setFeatures,
    } = this.props;

    const { integers, floats } = this.state;
    if (file.size > maxFileSizeBytes) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'List exceeds maximum allowable size',
        dialogMessage: locationsPage.oversizedUploadText,
      });
      setUploading(false);
      return;
    }

    discernProjection(file).then((projDefs) => {
      if (!projDefs[0]) {
        const formData = new FormData();
        formData.append('file', file);
        const xmlhttp = new XMLHttpRequest();

        xmlhttp.open('POST', convertURL);
        xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const response = JSON.parse(xmlhttp.responseText);
            const { data } = response;
            if (
              data &&
              data.attributes &&
              data.attributes.features &&
              data.attributes.features.length > 0
            ) {
              if (data.attributes.features.length > maxLocations) {
                this.setState({
                  dialogOpen: true,
                  dialogTitle: 'List exceeds maximum allowable size',
                  dialogMessage: locationsPage.oversizedUploadText,
                });
                setUploading(false);
                return;
              }
              const oldSpatialRef = new SpatialReference(projDefs[1]);
              const newSpatialRef = new SpatialReference(4326);
              data.attributes.features.forEach((feat) => {
                const { properties } = feat;
                if (properties.Verified_) {
                  feat.properties['Verified?'] = properties.Verified_;
                }

                if (
                  feat.geometry &&
                  feat.geometry.coordinates &&
                  feat.geometry.coordinates.length &&
                  feat.geometry.coordinates[0].constructor === Array
                ) {
                  const esriJson = geojsonUtil.geojsonToArcGIS(feat.geometry);
                  const oldFeatGeometry = new Polygon({
                    rings: esriJson.rings,
                    spatialReference:
                      esriJson.spatialReference.wkid === newSpatialRef.wkid
                        ? esriJson.spatialReference
                        : oldSpatialRef,
                  });
                  feat.geometry = this.projection.project(oldFeatGeometry, newSpatialRef);
                  feat.properties.Analysis_R = '';
                  if (!feat.properties['Analysis Radius']) {
                    feat.properties['Analysis Radius'] = '';
                  }

                  if (!feat.properties.Analysis_A) {
                    const area = GeometryEngine.geodesicArea(feat.geometry, 'hectares');
                    feat.properties.Analysis_A = area;
                  }

                  if (!feat.properties['Analysis Area']) {
                    feat.properties['Analysis Area'] = feat.properties.Analysis_A;
                  }

                  feat.properties.Latitude = this.returnLatLong(feat, 'Latitude');
                  feat.properties.Longitude = this.returnLatLong(feat, 'Longitude');
                } else if (
                  feat.geometry &&
                  feat.geometry.coordinates &&
                  feat.geometry.coordinates.length &&
                  typeof feat.geometry.coordinates[0] === 'number'
                ) {
                  const centerPoint = {
                    type: 'point',
                    x: feat.geometry.coordinates[0],
                    y: feat.geometry.coordinates[1],
                    spatialReference: oldSpatialRef,
                  };
                  const projectedCenterPoint = this.projection.project(centerPoint, newSpatialRef);
                  if (
                    feat.properties.Analysis_A &&
                    feat.properties.Analysis_A !== ' ' &&
                    feat.properties.Analysis_R &&
                    feat.properties.Analysis_R !== ' '
                  ) {
                    feat.properties.Analysis_A = '';
                    feat.geometry = GeometryEngine.geodesicBuffer(
                      projectedCenterPoint,
                      parseFloat(feat.properties.Analysis_R),
                      'kilometers'
                    );
                  } else if (feat.properties.Analysis_R && feat.properties.Analysis_R !== ' ') {
                    feat.properties.Analysis_A = '';
                    feat.geometry = GeometryEngine.geodesicBuffer(
                      projectedCenterPoint,
                      parseFloat(feat.properties.Analysis_R),
                      'kilometers'
                    );
                  } else if (feat.properties.Analysis_A && feat.properties.Analysis_A !== ' ') {
                    feat.properties.Analysis_R = Math.sqrt(
                      parseFloat(feat.properties.Analysis_A) / Math.PI
                    );
                    feat.properties.Analysis_A = '';
                    feat.geometry = GeometryEngine.geodesicBuffer(
                      projectedCenterPoint,
                      parseFloat(feat.properties.Analysis_R),
                      'kilometers'
                    );
                  }

                  if (!feat.properties['Analysis Area']) {
                    feat.properties['Analysis Area'] = feat.properties.Analysis_A;
                  }

                  if (!feat.properties['Analysis Radius']) {
                    feat.properties['Analysis Radius'] = feat.properties.Analysis_R;
                  }

                  feat.properties.Latitude = projectedCenterPoint.latitude;
                  feat.properties.Longitude = projectedCenterPoint.longitude;
                }
              });

              let headerKey;
              let active = activeTemplate;

              if (addType === 'commodity' && active === 'investment') {
                if (commodityType === 'palmOil') {
                  active = 'palmGeneric';
                } else if (commodityType === 'soy') {
                  active = 'soyGeneric';
                } else if (commodityType === 'cattle') {
                  active = 'cattleGeneric';
                } else if (commodityType === 'cocoa') {
                  active = 'cocoaGeneric';
                }
              }
              locationsPage.tableKeyArray.forEach((object) => {
                if (object.activeTemplate === active) {
                  headerKey = object.templateDataValue;
                }
              });
              const headerArray = [];
              const shortHeaders = [];

              templateData.forEach((template) => {
                if (template.template_name === headerKey) {
                  shortHeaders.push(
                    template.template_datum_field_name.split(' ').join('_').substring(0, 10)
                  );
                  headerArray.push(template.template_datum_field_name);
                }
              });

              let matchingTemplate = true;
              const resultsKeys = Object.keys(data.attributes.features[0].properties);

              const missingHeaders = [];
              shortHeaders.forEach((header, i) => {
                if (
                  resultsKeys.indexOf(header) === -1 &&
                  locationsPage.upload.generatedHeaderFields.indexOf(headerArray[i]) === -1
                ) {
                  missingHeaders.push(headerArray[i]);
                  matchingTemplate = false;
                  console.log(`Your data is missing a property: ${headerArray[i]} !`);
                }
              });

              if (matchingTemplate) {
                data.attributes.features.forEach((feature) => {
                  const keys = shortHeaders;
                  if (headerArray.indexOf('Time Horizon') === -1) {
                    feature['Time Horizon'] = '';
                  }
                  keys.forEach((key, k) => {
                    if (integers.indexOf(key) > -1) {
                      if (
                        (key === 'Analysis Area' && feature[key] !== '') ||
                        (key === 'Analysis Radius' && feature[key] !== '')
                      ) {
                        feature[headerArray[k]] = parseInt(feature.properties[key], 10);
                        if (isNaN(feature[headerArray[k]])) {
                          feature[headerArray[k]] = '';
                        }
                      } else if (
                        (key === 'Analysis Area' && feature[key] === '') ||
                        (key === 'Analysis Radius' && feature[key] === '')
                      ) {
                        feature[headerArray[k]] = feature.properties[key];
                      } else {
                        feature[headerArray[k]] = parseInt(feature.properties[key], 10);
                        if (isNaN(feature[headerArray[k]])) {
                          feature[headerArray[k]] = '';
                        }
                      }
                    } else if (floats.indexOf(key) > -1) {
                      if (
                        (key === 'Analysis Area' && feature[key] !== '') ||
                        (key === 'Analysis Radius' && feature[key] !== '')
                      ) {
                        feature[headerArray[k]] = parseFloat(feature.properties[key]);
                        if (isNaN(feature[headerArray[k]])) {
                          feature[headerArray[k]] = '';
                        }
                      } else if (
                        (key === 'Analysis Area' && feature[key] === '') ||
                        (key === 'Analysis Radius' && feature[key] === '')
                      ) {
                        feature[headerArray[k]] = feature.properties[key];
                      } else {
                        feature[headerArray[k]] = parseFloat(feature.properties[key]);
                        if (isNaN(feature[headerArray[k]])) {
                          feature[headerArray[k]] = '';
                        }
                      }
                    } else if (
                      (feature.properties[key] !== '' && key === 'Start_Date') ||
                      (feature.properties[key] !== '' && key === 'End_Date')
                    ) {
                      if (feature.properties[key] === null) {
                        feature[headerArray[k]] = '';
                      } else {
                        const date = new Date(feature.properties[key]);
                        if (!isNaN(date.getUTCFullYear())) {
                          const dateString = `${
                            date.getUTCMonth() + 1
                          }/${date.getUTCDate()}/${date.getUTCFullYear()}`;
                          feature[headerArray[k]] = dateString;
                        }
                      }
                    } else {
                      feature[headerArray[k]] = feature.properties[key];
                    }
                  });

                  Object.keys(feature.properties).forEach((featureProp) => {
                    const shortenedProp = featureProp.split(' ').join('_').substring(0, 10);
                    if (keys.indexOf(featureProp) === -1 && keys.indexOf(shortenedProp) === -1) {
                      feature[featureProp] = feature.properties[featureProp];
                    }
                  });

                  delete feature.properties;

                  if (!feature.Attribute1) {
                    delete feature.Attribute1;
                  }
                  if (!feature.Attribute2) {
                    delete feature.Attribute2;
                  }
                  if (!feature.Attribute3) {
                    delete feature.Attribute3;
                  }
                  feature['Accuracy Rating of Location Entered'] = accuracy;
                });
                this.setState({ totalFeatures: data.attributes.features.length });
                setFeatures(data.attributes.features);
              } else {
                const templateDescription = locationsPage.messageText[activeTemplate]
                  ? locationsPage.messageText[activeTemplate].text
                  : activeTemplate;
                let text = `The uploaded file format does not match the ${templateDescription} template type. Please make sure the template type selected in Pro matches the uploaded template type.`;
                if (missingHeaders.length > 0) {
                  text += ` If the template type is correct, the following fields are missing: ${missingHeaders.join(
                    ', '
                  )}`;
                }
                this.setState({
                  dialogOpen: true,
                  dialogTitle: 'Incorrect template uploaded',
                  dialogMessage: text,
                });
                setUploading(false);
              }
            }
          } else if (xmlhttp.readyState === 4) {
            setUploading(false);
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Error',
              dialogMessage: 'The shapefile could not be processed, Please try again shortly',
            });
          }
        };

        xmlhttp.send(formData);
      } else {
        setUploading(false);
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Incorrect template uploaded',
          dialogMessage: projDefs[0],
        });
        gtag('event', 'upload location upload projection error', {
          event_category: 'Locations File Upload error',
          event_label: 'user uploaded a shapefile in the wrong projection',
        });
      }
    });
  };

  parseXlsx = (f) => {
    const {
      setUploading,
      activeTemplate,
      addType,
      commodityType,
      templateData,
      accuracy,
      setFeatures,
    } = this.props;
    const { integers, floats } = this.state;
    const reader = new FileReader();
    if (f.size > maxFileSizeBytes) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'List exceeds maximum allowable size',
        dialogMessage: locationsPage.oversizedUploadText,
      });
      setUploading(false);
      return;
    }

    reader.onload = (e) => {
      const data = !e ? reader.content : e.target.result;

      /* if binary string, read with type 'binary' */
      const workbook = XLSX.read(data, {
        type: 'binary',
        cellDates: true,
        dateNF: 'mm/dd/yyyy',
      });
      const jsonVar = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        header: 1,
      });

      if (jsonVar.length > 1501) {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'List exceeds maximum allowable size',
          dialogMessage: locationsPage.oversizedUploadText,
        });
        setUploading(false);
        return;
      }

      const dataObjArray = [];
      let headers = [];
      jsonVar.forEach((arr, i) => {
        if (i === 0) {
          headers = arr;
        } else if (arr.length > 0) {
          const newObj = {};
          headers.forEach((header, j) => {
            if (arr[j]) {
              newObj[headers[j]] = typeof arr[j] === 'string' ? arr[j].trim() : arr[j];
            } else {
              newObj[headers[j]] = '';
            }
          });
          dataObjArray.push(newObj);
        }
      });

      let headerKey;
      let active = activeTemplate;

      if (addType === 'commodity' && active === 'investment') {
        if (commodityType === 'palmOil') {
          active = 'palmGeneric';
        } else if (commodityType === 'soy') {
          active = 'soyGeneric';
        } else if (commodityType === 'cattle') {
          active = 'cattleGeneric';
        } else if (commodityType === 'cocoa') {
          active = 'cocoaGeneric';
        }
      }

      locationsPage.tableKeyArray.forEach((object) => {
        if (object.activeTemplate === active) {
          headerKey = object.templateDataValue;
        }
      });

      const headerArray = [];
      templateData.forEach((template) => {
        if (template.template_name === headerKey) {
          if (
            activeTemplate !== 'palmMill' ||
            (template.template_datum_field_name !== 'Latitude' &&
              template.template_datum_field_name !== 'Longitude')
          ) {
            headerArray.push(template.template_datum_field_name);
          }
        }
      });

      let matchingTemplate = true;
      let wrongTemplateUploaded = false;
      const resultsKeys = Object.keys(dataObjArray[0]);
      if (resultsKeys.indexOf('Time Horizon') === -1) {
        resultsKeys['Time Horizon'] = '';
      }

      const missingHeaders = [];
      headerArray.forEach((header) => {
        if (
          resultsKeys.indexOf(header) === -1 &&
          locationsPage.upload.generatedHeaderFields.indexOf(header) === -1
        ) {
          missingHeaders.push(header);
          matchingTemplate = false;
          console.log(`Your data is missing a property: ${header} !`);
        }
        if (
          resultsKeys.indexOf('RSPO Model') > -1 &&
          (activeTemplate === 'soyGeneric' ||
            activeTemplate === 'cocoaGeneric' ||
            activeTemplate === 'cattleGeneric')
        ) {
          matchingTemplate = false;
          wrongTemplateUploaded = true;
        }
      });

      const templateDescription = locationsPage.messageText[activeTemplate]
        ? locationsPage.messageText[activeTemplate].text
        : activeTemplate;
      if (matchingTemplate) {
        const submittedData = [];
        dataObjArray.forEach((feature) => {
          if (this.isValidRow(feature)) {
            if (!feature.Attribute1) {
              delete feature.Attribute1;
            }
            if (!feature.Attribute2) {
              delete feature.Attribute2;
            }
            if (!feature.Attribute3) {
              delete feature.Attribute3;
            }
            submittedData.push(feature);
          }
        });
        submittedData.forEach((feature) => {
          const keys = Object.keys(feature);
          if (!keys.indexOf('Time Horizon') === -1) {
            feature['Time Horizon'] = '';
          }
          feature['Accuracy Rating of Location Entered'] = accuracy;

          keys.forEach((key) => {
            if (integers.indexOf(key) > -1) {
              if (
                (key === 'Analysis Area' && feature[key] !== '') ||
                (key === 'Analysis Radius' && feature[key] !== '')
              ) {
                feature[key] = parseInt(feature[key], 10);
                if (isNaN(feature[key])) {
                  feature[key] = '';
                }
              } else if (
                (key === 'Analysis Area' && feature[key] === ' ') ||
                (key === 'Analysis Radius' && feature[key] === '')
              ) {
                if (isNaN(feature[key])) {
                  feature[key] = '';
                }
              } else {
                feature[key] = parseFloat(feature[key]) ? parseFloat(feature[key]) : feature[key];
              }
            } else if (floats.indexOf(key) > -1) {
              if (
                (key === 'Analysis Area' && feature[key] !== '') ||
                (key === 'Analysis Radius' && feature[key] !== '')
              ) {
                feature[key] = parseFloat(feature[key]);
                if (isNaN(feature[key])) {
                  feature[key] = '';
                }
              } else if (
                (key === 'Analysis Area' && feature[key] === '') ||
                (key === 'Analysis Radius' && feature[key] === '')
              ) {
                if (isNaN(feature[key])) {
                  feature[key] = '';
                }
              } else {
                feature[key] = parseFloat(feature[key]) ? parseFloat(feature[key]) : feature[key];
              }
            }
          });
        });
        this.setState({ totalFeatures: submittedData.length });
        console.log('excel parse done', submittedData);

        /**
         * Check Location Classification Validity
         * @param {Array} submittedData - Locations from Excel file
         * @param {String} templateDescription - Template name
         * @return {boolean} - returns true is all Location Classification have value and template is in 'excelLocationClassificationMandatory' list
         */
        const checkLocationClassificationValidity = (
          localSubmittedData,
          localTemplateDescription
        ) => {
          const allLocationClassificationHaveValue = _every(
            localSubmittedData,
            'Location Classification'
          );
          return (
            excelLocationClassificationMandatory.includes(localTemplateDescription) &&
            allLocationClassificationHaveValue
          );
        };

        const excluded = excelLocationClassificationExcluded.includes(templateDescription);
        if (
          (excelLocationClassificationMandatory.includes(templateDescription) &&
            checkLocationClassificationValidity(submittedData, templateDescription)) ||
          excluded
        ) {
          this.setState({ totalFeatures: submittedData.length });
          setFeatures(submittedData);
        } else {
          setUploading(false);
          this.setState({
            dialogOpen: true,
            dialogTitle: 'Mandatory template information missing',
            dialogMessage:
              'The uploaded file is missing mandatory information. Please make sure the template uploaded in Pro includes data in the following fields: Location Classification',
          });
        }
      } else if (wrongTemplateUploaded) {
        let text = `The uploaded file format does not match the ${templateDescription} template type. Please make sure the template type selected in Pro matches the uploaded template type.`;
        if (missingHeaders.length > 0) {
          text += ` If the template type is correct, the following fields are missing: ${missingHeaders.join(
            ', '
          )}`;
        }
        setUploading(false);
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Incorrect template uploaded',
          dialogMessage: text,
        });
      } else {
        let text = `The uploaded file format does not match the ${templateDescription} template type. Please make sure the template type selected in Pro matches the uploaded template type.`;
        if (missingHeaders.length > 0) {
          text += ` If the template type is correct, the following fields are missing: ${missingHeaders.join(
            ', '
          )}`;
        }
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Incorrect template uploaded',
          dialogMessage: text,
        });
        setUploading(false);
      }
    };
    reader.readAsBinaryString(f);
  };

  parseKML = async (file) => {
    const {
      addType,
      activeTemplate,
      templateData,
      commodityType,
      setUploading,
      accuracy,
      setFeatures,
    } = this.props;

    let kmlFile = file;
    if (file.name.includes('.kmz')) {
      kmlFile = await parse(file, ZipLoader);
      kmlFile = kmlFile['doc.kml'];
    }

    const data = await load(kmlFile, KMLLoader);

    let propertiesKeys = Object.keys(data.features[0].properties);
    const analysisArea = propertiesKeys.Analysis_A ? 'Analysis_A' : 'Analysis Area';
    const analysisRadius = propertiesKeys.Analysis_R ? 'Analysis_R' : 'Analysis Radius';

    if (data && data.features && data.features.length > maxLocations) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'List exceeds maximum allowable size',
        dialogMessage: locationsPage.oversizedUploadText,
      });
      setUploading(false);
      return;
    }

    if (data && data.features && data.features.length > 0) {
      data.features.forEach((feat) => {
        if (feat.properties.description) {
          processKmlDescription(feat);
        }

        if (
          feat.geometry &&
          feat.geometry.coordinates &&
          feat.geometry.coordinates.length &&
          Array.isArray(feat.geometry.coordinates[0])
        ) {
          const esriJson = geojsonUtil.geojsonToArcGIS(feat.geometry);

          feat.geometry = new Polygon({
            rings: esriJson.rings,
            spatialReference: esriJson.spatialReference,
          });

          if (!feat.properties[analysisRadius]) {
            feat.properties[analysisRadius] = '';
          }

          if (!feat.properties[analysisArea]) {
            feat.properties[analysisArea] = GeometryEngine.geodesicArea(feat.geometry, 'hectares');
          }

          feat.properties.Latitude =
            feat.properties.Latitude || this.returnLatLong(feat, 'Latitude');
          feat.properties.Longitude =
            feat.properties.Longitude || this.returnLatLong(feat, 'Longitude');
        } else if (
          feat.geometry &&
          feat.geometry.coordinates &&
          feat.geometry.coordinates.length &&
          typeof feat.geometry.coordinates[0] === 'number'
        ) {
          const centerPoint = new Point({
            latitude: feat.geometry.coordinates[1],
            longitude: feat.geometry.coordinates[0],
          });
          const lat = centerPoint.latitude;
          const lng = centerPoint.longitude;

          if (
            (feat.properties.Analysis_A &&
              feat.properties.Analysis_A !== ' ' &&
              feat.properties.Analysis_R &&
              feat.properties.Analysis_R !== ' ') ||
            (feat.properties.Analysis_R && feat.properties.Analysis_R !== ' ')
          ) {
            feat.properties.Analysis_A = '';
            feat.geometry = GeometryEngine.geodesicBuffer(
              centerPoint,
              parseFloat(feat.properties.Analysis_R),
              'kilometers'
            );
          } else if (feat.properties.Analysis_A && feat.properties.Analysis_A !== ' ') {
            feat.properties.Analysis_R = Math.sqrt(feat.properties.Analysis_A / Math.PI);
            feat.geometry = GeometryEngine.geodesicBuffer(
              centerPoint,
              parseFloat(feat.properties.Analysis_R),
              'kilometers'
            );
            feat.properties.Analysis_A = '';
          }

          if (!feat.properties[analysisArea]) {
            feat.properties[analysisArea] = feat.properties.Analysis_A;
          }

          if (!feat.properties[analysisRadius]) {
            feat.properties[analysisRadius] = feat.properties.Analysis_R;
          }

          feat.properties.Latitude = lat;
          feat.properties.Longitude = lng;
        }
      });

      propertiesKeys = Object.keys(data.features[0].properties);
      const templateHeadersList = getTemplateHeadersList({
        addType,
        commodityType,
        activeTemplate,
        templateData,
      });
      const headerMapping = getHeaderMapping(templateHeadersList, propertiesKeys);

      const missingHeaders = [];
      let matchingTemplate = true;
      let wrongTemplateUploaded = false;
      templateHeadersList.forEach((header) => {
        const generatedHeaderMatch =
          locationsPage.upload.generatedHeaderFields.indexOf(header) === -1;
        if (!headerMapping[header] && generatedHeaderMatch) {
          missingHeaders.push(header);
          matchingTemplate = false;
          console.log(`Your data is missing a property: ${header} !`);
        }

        if (
          propertiesKeys.indexOf('RSPO Model') > -1 &&
          (activeTemplate === 'soyGeneric' ||
            activeTemplate === 'cocoaGeneric' ||
            activeTemplate === 'cattleGeneric')
        ) {
          matchingTemplate = false;
          wrongTemplateUploaded = true;
        }
      });

      const templateDescription = locationsPage.messageText[activeTemplate]
        ? locationsPage.messageText[activeTemplate].text
        : activeTemplate;
      if (matchingTemplate) {
        data.features.forEach((feature) => {
          feature['Accuracy Rating of Location Entered'] = accuracy;
          if (templateHeadersList.indexOf('Time Horizon') === -1) {
            feature['Time Horizon'] = '';
          }

          templateHeadersList.forEach((key) => {
            const header = headerMapping[key];

            const { integers, floats } = this.state;
            if (integers.indexOf(key) > -1) {
              feature[key] = parseInt(feature.properties[header], 10);
              if (isNaN(feature[key])) {
                feature[key] = '';
              }
            } else if (floats.indexOf(key) > -1) {
              feature[key] = parseFloat(feature.properties[header]);
              if (isNaN(feature[key])) {
                feature[key] = '';
              }
            } else if (key.indexOf('Date') > -1) {
              feature[key] =
                feature.properties[header].length > 0
                  ? moment(feature.properties[header]).format('MM/DD/YYYY')
                  : '';
            } else {
              feature[key] = feature.properties[header];
            }

            if (!feature[key] && key.indexOf('_') > -1) {
              const spaceKey = key.split('_');
              if (spaceKey.length > 1) {
                const newAttr = feature.properties[spaceKey.join(' ')];
                if (newAttr) {
                  feature[key] = newAttr;
                }
              }
            }
            delete feature.properties[key];
          });
          delete feature.properties;

          if (!feature.Attribute1) {
            delete feature.Attribute1;
          }
          if (!feature.Attribute2) {
            delete feature.Attribute2;
          }
          if (!feature.Attribute3) {
            delete feature.Attribute3;
          }
          feature['Accuracy Rating of Location Entered'] = accuracy;
        });
        this.setState({ totalFeatures: data.features.length });
        setFeatures(data.features);
      } else if (wrongTemplateUploaded) {
        let text = `The uploaded file format does not match the ${templateDescription} template type. Please make sure the template type selected in Pro matches the uploaded template type.`;
        if (missingHeaders.length > 0) {
          text += ` If the template type is correct, the following fields are missing: ${missingHeaders.join(
            ', '
          )}`;
        }
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Error',
          dialogMessage: text,
        });
        setUploading(false);
      } else {
        let text = `The uploaded file format does not match the ${templateDescription} template type. Please make sure the template type selected in Pro matches the uploaded template type. `;
        if (missingHeaders.length > 0) {
          text += ` If the template type is correct, the following fields are missing: ${missingHeaders.join(
            ', '
          )}`;
        }
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Incorrect template uploaded',
          dialogMessage: text,
        });
        setUploading(false);
      }
    }
  };

  onFileUpload = (file) => {
    const { setUploading, resetFeatureResults } = this.props;
    setUploading(true);
    resetFeatureResults();

    const fileExtension = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
    if (fileExtension === 'csv') {
      if (file.size > maxFileSizeBytes) {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'List exceeds maximum allowable size',
          dialogMessage: locationsPage.oversizedUploadText,
        });
        setUploading(false);
        return;
      }

      const config = {
        delimiter: '',
        newline: '',
        header: true,
        dynamicTyping: true,
        preview: 0,
        encoding: '',
        worker: false,
        comments: false,
        complete: this.complete,
        error: this.error,
        download: false,
        skipEmptyLines: false,
      };
      Papa.parse(file, config);
    } else if (fileExtension === 'zip') {
      this.parseZip(file);
    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      this.parseXlsx(file);
    } else if (fileExtension === 'kml' || fileExtension === 'kmz') {
      this.parseKML(file);
    } else {
      console.log('wrong file type - not a csv or zip');
      this.setState(messageIncorrectFileTypeUpload);
      setUploading(false);
    }
  };

  toggleValidated = (evt) => {
    if (evt.target.value === 'all') {
      gtag('event', 'User clicks All locations radio button on validation step', {
        event_category: 'Upload Locations Click',
        event_label: 'Validation step 3',
      });
    } else if (evt.target.value === 'invalid') {
      gtag('event', 'User clicks Locations with errors on validation step', {
        event_category: 'Upload Locations Click',
        event_label: 'Validation step 3',
      });
    }
    this.setState({ showValidated: evt.target.value });
  };

  editTableCell = (value, feature, singleKey) => {
    const { features, activeTemplate, updateFeatures } = this.props;
    const newFeaturesState = features.slice();

    const analysisFieldsEditing = {
      'Analysis Radius': '',
      'Analysis Area': '',
    };

    features.forEach((item, index) => {
      if (item.location_id === feature.location_id) {
        let valid = true;
        newFeaturesState[index][singleKey] = value;
        newFeaturesState[index].invalidFields = [];

        // eslint-disable-next-line no-unused-vars
        for (const key in feature) {
          if (key === 'Analysis Radius' || key === 'Analysis Area') {
            analysisFieldsEditing[key] = feature[key];
          }

          if (fieldValidations[key] && key.toLowerCase() === 'start date') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key], feature['End Date']) === false) {
                valid = false;
                newFeaturesState[index].invalidFields.push(key);
              }
            });
          } else if (fieldValidations[key] && key.toLowerCase() === 'certification') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key], activeTemplate) === false) {
                valid = false;
                newFeaturesState[index].invalidFields.push(key);
              }
            });
          } else if (fieldValidations[key] && key.toLowerCase() === 'rspo model') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key], activeTemplate) === false) {
                valid = false;
                newFeaturesState[index].invalidFields.push(key);
              }
            });
          } else if (fieldValidations[key] && key.toLowerCase() === 'company id') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key], activeTemplate) === false) {
                valid = false;
                newFeaturesState[index].invalidFields.push(key);
              }
            });
          } else if (key.toLowerCase() === 'id' && activeTemplate === 'palmMill') {
            if (feature.invalidWriId) {
              valid = false;
              newFeaturesState[index].invalidFields.push(key);
            }
          } else if (fieldValidations[key] && key.toLowerCase() !== 'company id') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key]) === false) {
                valid = false;
                newFeaturesState[index].invalidFields.push(key);
              }
            });
          }
        }

        if (
          analysisFieldsEditing['Analysis Radius'] !== '' &&
          analysisFieldsEditing['Analysis Radius'] !== 0 &&
          analysisFieldsEditing['Analysis Area'] !== '' &&
          analysisFieldsEditing['Analysis Area'] !== 0
        ) {
          valid = false;
          newFeaturesState[index].invalidFields.push('Analysis Radius');
          newFeaturesState[index].invalidFields.push('Analysis Area');
        } else if (
          analysisFieldsEditing['Analysis Radius'] === '' &&
          analysisFieldsEditing['Analysis Area'] === ''
        ) {
          valid = false;
          newFeaturesState[index].invalidFields.push('Analysis Radius');
          newFeaturesState[index].invalidFields.push('Analysis Area');
        }

        newFeaturesState[index].valid = valid;
        updateFeatures(newFeaturesState);
      }
    });
  };

  downloadCsv = () => {
    let { features } = this.props;
    const { addType } = this.props;
    const { showValidated } = this.state;
    const csvData = [[]];
    // eslint-disable-next-line no-unused-vars
    for (const key in features[0]) {
      if (
        key !== 'valid' &&
        key !== 'invalidFields' &&
        key !== 'geometry' &&
        key !== 'type' &&
        key !== 'gadmid'
      ) {
        if (addType === 'commodity') {
          if (
            key !== 'Wind Barrier' &&
            key !== 'Riparian Buffers' &&
            key !== 'Buffer Zones' &&
            key !== 'Accuracy Rating of Location Entered'
          ) {
            csvData[0].push(key);
            if (key === 'Time Horizon') {
              csvData[0].push('Accuracy Rating of Location Entered');
            }
          }
        } else if (key !== 'Accuracy Rating of Location Entered') {
          csvData[0].push(key);
          if (key === 'Time Horizon') {
            csvData[0].push('Accuracy Rating of Location Entered');
          }
        }
      }
    }

    if (showValidated === 'invalid') {
      features = features.filter((item) => !item.valid);
    }

    features.forEach((feature) => {
      const dataRow = [];
      // eslint-disable-next-line no-unused-vars
      for (const key in feature) {
        if (
          key !== 'valid' &&
          key !== 'invalidFields' &&
          key !== 'geometry' &&
          key !== 'type' &&
          key !== 'gadmid' &&
          key !== 'Accuracy Rating of Location Entered'
        ) {
          if (addType === 'commodity') {
            if (key !== 'Wind Barrier' && key !== 'Riparian Buffers' && key !== 'Buffer Zones') {
              dataRow.push(
                feature[key] && feature[key].includes && feature[key].includes(',')
                  ? `"${feature[key]}"`
                  : feature[key]
              );
              if (key === 'Time Horizon') {
                const acc = feature['Accuracy Rating of Location Entered'];
                dataRow.push(acc && acc.includes && acc.includes(',') ? `"${acc}"` : acc);
              }
            }
          } else {
            dataRow.push(
              feature[key] && feature[key].includes && feature[key].includes(',')
                ? `"${feature[key]}"`
                : feature[key]
            );
            if (key === 'Time Horizon') {
              const acc = feature['Accuracy Rating of Location Entered'];
              dataRow.push(acc && acc.includes && acc.includes(',') ? `"${acc}"` : acc);
            }
          }
        }
      }
      csvData.push(dataRow);
    });

    downloaders.downloadCSV(csvData);
    gtag('event', 'User clicks Download from validation step', {
      event_category: 'Upload Locations Click',
      event_label: 'Validation step 3',
    });
  };

  premiumFileUpload = (file) => {
    if (!file) {
      return;
    }

    const { updateFeatures } = this.props;

    const fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
    switch (fileExtension) {
      case 'csv':
      case 'zip':
      case 'xlsx':
      case 'kml':
      case 'kmz':
        updateFeatures(file);
        break;
      default:
        console.log(
          `File extension ${file.name.slice(-3)} is not supported. (csv, xlx, zip, kml, kmz)`
        );
        this.setState({
          dialogOpen: true,
          dialogTitle: locationsPage.add.errors.fileExtensionNotSupported.title,
          dialogMessage: locationsPage.add.errors.fileExtensionNotSupported.message,
        });
    }
  };

  render() {
    const { dialogOpen, dialogTitle, dialogMessage, inputKey, totalFeatures, showValidated } =
      this.state;
    const {
      features,
      isUploading,
      addType,
      activeTemplate,
      commodityType,
      customAttributeHeaders,
      templateData,
    } = this.props;

    const validFeatures = features.filter((item) => item.valid).length;
    const invalidFeatures = features.length - validFeatures;

    const dialogContent =
      typeof dialogMessage === 'string' ? dialogMessage : dialogMessage.map(this.generateMessages);
    const defaultAction = [
      <Button
        className="dialog__primary-action"
        variant="primary"
        label="OK"
        onClick={this.shouldCloseDialog}
      />,
    ];

    const { stepThree } = locationsPage.upload;

    return (
      <div className="locations-upload-step flex-grid-column">
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={this.shouldCloseDialog}
        >
          {dialogContent}
        </Dialog>
        <h2 className="locations-upload-step__step-title">{stepThree.title}</h2>
        <div className="flex-grid">
          <FileDrop
            inputKey={inputKey}
            isUploading={isUploading && features.length === 0}
            onFileUpload={this.onFileUpload}
          />
          <div className="instructions-container flex-grid-column">
            <p>
              {locationsPage.upload.maximumLocations}{' '}
              <strong>{numberWithCommas(maxLocations)}</strong>
            </p>
            <p>
              {locationsPage.upload.maximumFilesize} <strong>{maxFileSizeMB}MB</strong>
            </p>
            <p>{locationsPage.upload.filetypes.title}</p>
            <ul>
              <li>{locationsPage.upload.filetypes.csv}</li>
              <li>{locationsPage.upload.filetypes.zip}</li>
              <li>{locationsPage.upload.filetypes.kml}</li>
            </ul>
          </div>
        </div>
        {features.length > 0 && (
          <>
            {invalidFeatures > 0 && (
              <Banner intent="danger">
                <span>{stepThree.errorInstructions}</span>
              </Banner>
            )}
            <div className="table-controls-container flex-grid space-between">
              <div className="table-controls-container__view-toggle flex-grid align-center">
                <span className="label">{stepThree.show}:</span>
                <input
                  type="radio"
                  id="uploadNoValidateRadio"
                  value="invalid"
                  name="upload-no-validate"
                  checked={showValidated === 'invalid'}
                  onChange={this.toggleValidated}
                />
                <label htmlFor="uploadNoValidateRadio" className="locations-select-type-label">
                  {stepThree.locationsWithErrors}
                </label>

                <input
                  type="radio"
                  id="uploadAnyRadio"
                  value="all"
                  name="upload-any-validate"
                  checked={showValidated === 'all'}
                  onChange={this.toggleValidated}
                />
                <label htmlFor="uploadAnyRadio" className="locations-select-type-label">
                  {stepThree.locationsAll}
                </label>
              </div>
              <div className="table-controls-container__status-controls flex-grid align-center">
                {isUploading && (
                  <span className="flex-grid align-center">
                    <InlineLoader />
                  </span>
                )}
                <Button label={stepThree.download} onClick={this.downloadCsv} size="small" />
                <div className="badge badge--positive">
                  <IconBadgeCheck className="badge__icon-l" height="16" />
                  <span className="badge__text">
                    {numberWithCommas(validFeatures)} / {totalFeatures}
                  </span>
                </div>
                <div className="badge badge--danger">
                  <IconExclamationTriangle className="badge__icon-l" height="16" />
                  <span className="badge__text">
                    {numberWithCommas(invalidFeatures)} / {totalFeatures}
                  </span>
                </div>
              </div>
            </div>
            <div className="gfw-table">
              <MultiGridTable
                addType={addType}
                activeTemplate={activeTemplate}
                commodityType={commodityType}
                customAttributeHeaders={customAttributeHeaders}
                features={_getFeatures(prepUploadFeatures_AddLocationID(features), showValidated)}
                initialColumnIsValid
                templateData={templateData}
                _editTableCell={this.editTableCell}
              />
            </div>
          </>
        )}
      </div>
    );
  }
}
