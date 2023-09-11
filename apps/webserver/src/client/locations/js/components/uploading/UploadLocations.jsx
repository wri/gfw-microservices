/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Dialog from 'material-ui/Dialog';
import Point from 'esri/geometry/Point';
import Polygon from 'esri/geometry/Polygon';
import GeometryEngine from 'esri/geometry/geometryEngine';
import cloneDeep from 'lodash/cloneDeep';
import axios from 'axios';

import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import IconCheck from '../../../../common/js/components/icon/IconCheck';
import IconExclamationTriangle from '../../../../common/js/components/icon/IconExclamationTriangle';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import store from '../../store';
import { changeTemplate } from '../../actions/locationActions';
import httpRequest from '../../../../common/js/utils/httpRequest';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import { containsPunctuation, dataCleanup, getListStatusId } from '../../utils/lists.utils';
import { fieldValidations } from '../../utils/validations';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';
import { esriQuery } from '../../utils/esriTasks';
import { NO_MESSAGE } from '../../utils/history.utils';
import { loaderMessages, locationsPage, DATA_API_URL } from '../../../../common/js/config';
import SaveAsDraftNote from '../../../../common/js/components/SaveAsDraft/SaveAsDraftNote';
import SaveAsDraftButtonWithDialog from '../../../../common/js/components/SaveAsDraft/SaveAsDraftButtonWithDialog';

import Navigator from './Navigator';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';

// REDUX - Store

// Utils
import { deduceAdminBackoff } from '../../utils/backoff';
import { resetScroll } from '../../utils/scroll.utils';
import { getDialogContent, getDialogTitle } from '../../utils/dialogMessage.utils';
import { getListStatusIdByStatusName } from '../../utils/draft.utils';
import { getGadmService } from '../../../../common/js/utils/getGadmService.utils';

// Configs
import {
  appendListConfig,
  saveAsDraftListConfig,
  saveListConfig,
} from '../../../../../config/config/locations.config';
import { defaultCustomAttributeHeaders } from '../edit/table/MultiGridTable.config';
import { analysisTypes } from '../../../../../config/env/analysisTypes.constants';
// Style
import '../../../css/locations.scss';

class UploadLocations extends Component {
  historyUnblock = undefined;

  constructor(props) {
    super(props);

    const { activeTemplate } = props;

    this.state = {
      addType: '',
      commodityType: '',
      otherCommodityType: '',
      totalFeatures: 0,
      features: [],
      featureResults: [],
      uploadingData: [],
      selectedList: '',
      customList: activeTemplate,
      customAttributeHeaders: defaultCustomAttributeHeaders,
      showError: false,
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      dialogEmail: false,
      step: 1,
      canGoNext: true,
      isUploading: false,
      isSaving: false,
    };

    require(['esri/geometry/support/webMercatorUtils'], (webMercatorUtils) => {
      this.WebMercatorUtils = webMercatorUtils;
    });
  }

  componentDidMount() {
    const { step, dialogOpen, showError, isUploading, isSaving } = this.state;

    resetScroll();

    let nextStepError = this.getStepError(step);
    this.setState({ canGoNext: !nextStepError });

    const { history } = this.props;
    // eslint-disable-next-line consistent-return
    this.historyUnblock = history.block((location, action) => {
      const { pathname } = location;
      // Close modal on transition if open
      if (dialogOpen) {
        this.shouldCloseDialog();
      }
      // Clear errors on transition if visible
      if (showError) {
        this.setState({ showError: false });
      }
      // Disable back/forward buttons while form is uploading or saving
      if (isUploading || isSaving) {
        return NO_MESSAGE;
        // Trigger upload wizard cancel action before navigating back to locations landing
      }
      if (pathname === '/' && action === 'POP') {
        this.shouldRefresh();
      } else {
        const nextStep =
          location && location.state && typeof location.state.step === 'number'
            ? location.state.step
            : 1;
        nextStepError = this.getStepError(nextStep);
        this.setState({ canGoNext: !nextStepError, step: nextStep });
      }
    });
  }

  componentWillUnmount() {
    if (this.historyUnblock) {
      this.historyUnblock();
    }
  }

  setStep = (step) => {
    const { history } = this.props;
    history.push(`/upload/step/${step}`, { step });
  };

  toNextStep = () => {
    const { step } = this.state;
    this.setStep(step + 1);
  };

  toPrevStep = () => {
    resetScroll();
    const { history } = this.props;
    history.goBack();
  };

  displayUploadErrorDialog = () => {
    this.setState({
      isSaving: false,
      dialogOpen: true,
      dialogTitle: locationsPage.upload.errors.uploadErrorTile,
      dialogMessage: locationsPage.upload.errors.uploadErrorDialogMessage,
      dialogEmail: true,
    });
  };

  batchGeoms = (geojson) => {
    geojson.features.sort((a, b) => a.properties.longitude - b.properties.longitude);

    const geojsonBatches = [];
    const longitudeRanges = [];
    for (let l = -180; l < 180; l += 10) {
      longitudeRanges.push({
        min: l,
        max: l + 9.9999999,
        geo: {
          type: 'FeatureCollection',
          features: [],
        },
      });
    }

    geojson.features.forEach((feat) => {
      longitudeRanges.forEach((range) => {
        if (feat.properties.Longitude >= range.min && feat.properties.Longitude < range.max) {
          range.geo.features.push(feat);
        }
      });
    });

    longitudeRanges.forEach((range) => {
      if (range.geo.features.length > 0) {
        geojsonBatches.push(range.geo);
      }
    });

    return geojsonBatches;
  };

  assembleGeojson = (featProps, geometries) => {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    let wgsGeometry = {};
    const geomsToConvert = [];

    try {
      geometries.forEach((geom, i) => {
        if (!geom) {
          const geometry = new Point({
            latitude: featProps[i].Latitude,
            longitude: featProps[i].Longitude,
          });
          let value;
          if (parseFloat(featProps[i]['Analysis Radius'])) {
            value = parseFloat(featProps[i]['Analysis Radius']);
          } else if (parseFloat(featProps[i]['Analysis Area'])) {
            value = Math.sqrt(parseFloat(featProps[i]['Analysis Area'] / 100) / Math.PI);
          }

          const buffer = GeometryEngine.geodesicBuffer(geometry, value.toFixed(3), 'kilometers');

          // If the geometry's buffer is empty... (happens when a very small radius is given)
          if (!buffer) {
            throw new Error("If the geometry's buffer is empty");
          }

          if (buffer.spatialReference.wkid === 102100) {
            wgsGeometry = this.WebMercatorUtils.webMercatorToGeographic(buffer);
          } else {
            wgsGeometry = buffer;
          }

          geomsToConvert.push(wgsGeometry);
        } else {
          geomsToConvert.push(geom);
        }
      });
    } catch (error) {
      this.displayUploadErrorDialog();
    }

    geomsToConvert?.forEach((convertedGeom, j) => {
      const geojsonGeom = geojsonUtil.arcgisToGeoJSON(geomsToConvert[j]);
      const { coordinates } = geojsonGeom;

      for (let i = 0; i < coordinates?.length || 0; i += 1) {
        const ring = coordinates[i];
        ring.forEach((vertex) => {
          if (geomsToConvert[j].type === 'Polygon') {
            if (vertex.length > 2) {
              const newVertex = [];
              newVertex.push(vertex[0]);
              newVertex.push(vertex[1]);

              vertex = newVertex;
            }
          } else if (geomsToConvert[j].type === 'MultiPolygon') {
            vertex.forEach((subVertex) => {
              // vertex here is actually a ring! subVertex represents a point!
              if (subVertex.length > 2) {
                const newVertex = [];
                newVertex.push(subVertex[0]);
                newVertex.push(subVertex[1]);

                subVertex = newVertex;
              }
            });
          }
        });
      }

      if (Object.keys(geojsonGeom).length > 0) {
        geojson.features.push({
          type: 'Feature',
          properties: featProps[j],
          geometry: geojsonGeom,
        });
      }
    });
    return geojson;
  };

  calculateClippedArea = (geojson) => {
    geojson.features.forEach((feature) => {
      const esriJson = geojsonUtil.geojsonToArcGIS(feature);
      const esriGeometry = new Polygon({
        rings: esriJson.geometry.rings,
        spatialReference: {
          wkid: 4326,
        },
      });

      const area = GeometryEngine.geodesicArea(esriGeometry, 'hectares');
      feature.properties['Analysis Area'] = area;
    });
  };

  getValidatedFeatures = (nonValidatedFeatures) => {
    return nonValidatedFeatures.slice().map((feature) => {
      feature.valid = true;
      feature.invalidFields = [];
      const otherCommodity = {
        sugarCane: 'Sugar Cane',
        pulp: 'Pulp and Paper',
        rubber: 'Rubber',
        coffee: 'Coffee',
      };
      const classificationObj = {
        palmPlantation: { value: 'Property', commodity: 'Palm Oil' },
        palmMill: { value: 'Supply Shed', commodity: 'Palm Oil' },
        investment: { value: 'Supply Shed', commodity: 'Investment' },
        palmGeneric: { value: 'Supply Shed', commodity: 'Palm Oil' },
        palmFarm: { value: 'Property', commodity: 'Palm Oil' },
        cattle: { value: 'Property', commodity: 'Cattle' },
        cattleGeneric: { value: 'Supply Shed', commodity: 'Cattle' },
        beef: { value: 'Supply Shed', commodity: 'Cattle' },
        soyFarm: { value: 'Property', commodity: 'Soy' },
        soySilo: { value: 'Supply Shed', commodity: 'Soy' },
        soyGeneric: { value: 'Supply Shed', commodity: 'Soy' },
        cocoa: { value: 'Property', commodity: 'Cocoa' },
        other: { value: 'Supply Shed', commodity: 'Other' },
        generic: { value: 'Supply Shed', commodity: 'Generic' },
        cocoaGeneric: { value: 'Property', commodity: 'Cocoa' },
      };

      const unTouchables = ['Country', 'State', 'Sub State', 'Commodity'];

      const { commodityType, otherCommodityType, addType } = this.state;
      const { activeTemplate } = this.props;
      // Set Commodity here
      if (commodityType === 'multiple') {
        feature.Commodity = feature.Commodity
          ? feature.Commodity
          : classificationObj[activeTemplate]
          ? classificationObj[activeTemplate].commodity
          : otherCommodity[commodityType]
          ? otherCommodity[commodityType]
          : commodityType || 'Other';
      } else if (activeTemplate === 'investment') {
        feature.Commodity = classificationObj[commodityType]
          ? classificationObj[commodityType].commodity
          : otherCommodity[commodityType]
          ? otherCommodity[commodityType]
          : commodityType ||
            (classificationObj[activeTemplate]
              ? classificationObj[activeTemplate].commodity
              : 'Other');
      } else {
        feature.Commodity = classificationObj[activeTemplate]
          ? classificationObj[activeTemplate].commodity
          : otherCommodity[commodityType]
          ? otherCommodity[commodityType]
          : otherCommodityType ||
            commodityType ||
            (feature.Commodity ? feature.Commodity : 'Other');
      }

      if (addType === 'commodity') {
        feature['Location Classification'] = feature['Location Classification']
          ? feature['Location Classification']
          : classificationObj[activeTemplate].value;

        if (
          !activeTemplate.toLowerCase().includes('generic') &&
          !unTouchables.includes('Location Classification')
        ) {
          // not a generic template and we haven't already added it
          // to the list of unTouchable fields
          unTouchables.push('Location Classification');
        }
      }

      const analysisFields = {
        'Analysis Radius': '',
        'Analysis Area': '',
      };

      for (const key in feature) {
        if (feature[key] === undefined) {
          feature[key] = '';
        }

        if (key === 'Analysis Radius' || key === 'Analysis Area') {
          analysisFields[key] = feature[key];
        }

        if (key.toLowerCase() === 'start date') {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(feature[key], feature['End Date']) === false) {
              feature.valid = false;
              feature.invalidFields.push(key);
            }
          });
        } else if (key.toLowerCase() === 'certification') {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(feature[key], activeTemplate) === false) {
              feature.valid = false;
              feature.invalidFields.push(key);
            }
          });
        } else if (key.toLowerCase() === 'rspo model') {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(feature[key], activeTemplate) === false) {
              feature.valid = false;
              feature.invalidFields.push(key);
            }
          });
        } else if (key.toLowerCase() === 'company id') {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(feature[key], activeTemplate) === false) {
              feature.valid = false;
              feature.invalidFields.push(key);
            }
          });
        } else if (key.toLowerCase() === 'id' && activeTemplate === 'palmMill') {
          if (feature.invalidWriId) {
            feature.valid = false;
          }
        } else if (
          key !== 'valid' &&
          key !== 'checked' &&
          key !== 'invalidFields' &&
          key.toLowerCase() !== 'company id' &&
          fieldValidations[key]
        ) {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(feature[key]) === false) {
              feature.valid = false;
              feature.invalidFields.push(key);
            }
          });
        }
      }

      if (
        analysisFields['Analysis Radius'] !== '' &&
        analysisFields['Analysis Radius'] !== 0 &&
        analysisFields['Analysis Area'] !== '' &&
        analysisFields['Analysis Area'] !== 0
      ) {
        feature.valid = false;
        feature.invalidFields.push('Analysis Radius');
        feature.invalidFields.push('Analysis Area');
      } else if (
        analysisFields['Analysis Radius'] === '' &&
        analysisFields['Analysis Area'] === ''
      ) {
        feature.valid = false;
        feature.invalidFields.push('Analysis Radius');
        feature.invalidFields.push('Analysis Area');
      }
      return feature;
    });
  };

  saveLocations = ({ isSaveAsDraft }) => {
    const {
      selectedList,
      customList,
      addType,
      commodityType,
      customAttributeHeaders,
      uploadingData,
    } = this.state;
    const { activeTemplate, userLists, templateData } = this.props;
    this.setState(
      {
        isSaving: true,
      },
      () => {
        setTimeout(() => {
          if (selectedList === '') {
            const nameContainsPunctuation = containsPunctuation(customList.toLowerCase());
            if (customList === '') {
              this.setState({
                canGoNext: false,
                isSaving: false,
                dialogOpen: true,
                dialogTitle: 'List not created',
                dialogMessage: 'Please enter a name for the new list.',
              });
              return;
            }
            if (nameContainsPunctuation) {
              this.setState({
                canGoNext: false,
                isSaving: false,
                dialogOpen: true,
                dialogTitle: 'Invalid List Name',
                dialogMessage:
                  'The list name chosen contains punctuation. Please choose a list name with only letters, numbers, and/or spaces.',
              });
              return;
            }
          }

          const featProps = [];
          const geoms = [];
          let templateId;
          const customAttributes = [];
          const locationClassifications = [];

          if (addType === 'commodity') {
            let active = activeTemplate;

            if (active === 'investment') {
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
            const templateName = deduceActiveName(active);

            const activeTemplates = [];
            const customAttributeNames = [];

            templateData.forEach((template) => {
              if (template.template_name === templateName) {
                if (template.template_datum_field_name === 'Attribute1') {
                  if (customAttributeHeaders[0].custom !== 'Attribute1') {
                    template.template_datum_field_name_updated = customAttributeHeaders[0].custom;
                    customAttributeNames.push(template.template_datum_field_name_updated);
                  }
                } else if (template.template_datum_field_name === 'Attribute2') {
                  if (customAttributeHeaders[1].custom !== 'Attribute2') {
                    template.template_datum_field_name_updated = customAttributeHeaders[1].custom;
                    customAttributeNames.push(template.template_datum_field_name_updated);
                  }
                } else if (template.template_datum_field_name === 'Attribute3') {
                  if (customAttributeHeaders[2].custom !== 'Attribute3') {
                    template.template_datum_field_name_updated = customAttributeHeaders[2].custom;
                    customAttributeNames.push(template.template_datum_field_name_updated);
                  }
                } else {
                  activeTemplates.push(template);
                }
              }
            });

            const genericFields = [];
            activeTemplates.forEach((template) => {
              if (
                template.template_datum_field_name !== 'Attribute1' &&
                template.template_datum_field_name !== 'Attribute2' &&
                template.template_datum_field_name !== 'Attribute3'
              ) {
                genericFields.push(template.template_datum_field_name);
              }
            });

            customAttributeNames.forEach((customAtt) => {
              customAttributes.push({
                column_name: customAtt,
                column_type: 'Text',
              });
            });

            templateId = activeTemplates[0].template_id;

            uploadingData.forEach((feature) => {
              const properties = {};

              Object.keys(feature).forEach((prop) => {
                if (
                  prop === 'Location Classification' &&
                  locationClassifications.indexOf(feature[prop]) === -1
                ) {
                  locationClassifications.push(feature[prop]);
                }

                if (
                  prop !== 'checked' &&
                  prop !== 'valid' &&
                  prop !== 'Attribute1' &&
                  prop !== 'Attribute2' &&
                  prop !== 'Attribute3' &&
                  prop !== 'invalidFields' &&
                  prop !== 'type' &&
                  prop !== 'geometry' &&
                  prop !== 'location_id'
                ) {
                  if (customAttributeNames.indexOf(prop) > -1) {
                    // it is a custom attribute
                    properties[prop] = feature[prop];
                  } else if (genericFields.indexOf(prop) > -1) {
                    // it is a normal, expected attribute of this template
                    properties[prop] = feature[prop];
                  }
                }
              });

              if (!properties['Start Date']) {
                properties['Start Date'] = '';
              }
              if (!properties['End Date']) {
                properties['End Date'] = '';
              }

              properties['Wind Barrier'] = '';
              properties['Riparian Buffers'] = '';
              properties['Buffer Zones'] = '';
              properties.Latitude = feature.Latitude;
              properties.Longitude = feature.Longitude;
              properties.gadmid = feature.gadmid;

              featProps.push(properties);
              geoms.push(feature.geometry);
            });

            if (locationClassifications.length > 1) {
              this.setState({
                canGoNext: false,
                isSaving: false,
                dialogOpen: true,
                dialogTitle: 'Disparate Location Classifications',
                dialogMessage:
                  'This list contains locations with multiple location classifications. Please include one location classification per list.',
              });
              return;
            }
          } else {
            const activeTemplates = templateData.filter((template) => {
              return template.template_name === 'Investment';
            });

            templateId = activeTemplates[0].template_id;

            uploadingData.forEach((feature) => {
              const properties = {};

              Object.keys(feature).forEach((prop) => {
                if (
                  prop !== 'checked' &&
                  prop !== 'valid' &&
                  prop !== 'invalidFields' &&
                  prop !== 'type' &&
                  prop !== 'geometry' &&
                  prop !== 'location_id'
                ) {
                  properties[prop] = feature[prop];
                }
              });

              if (!properties['Start Date']) {
                properties['Start Date'] = '';
              }
              if (!properties['End Date']) {
                properties['End Date'] = '';
              }

              properties['Wind Barrier'] = '';
              properties['Riparian Buffers'] = '';
              properties['Buffer Zones'] = '';
              properties.Latitude = feature.Latitude;
              properties.Longitude = feature.Longitude;
              properties.gadmid = feature.gadmid;

              featProps.push(properties);
              geoms.push(feature.geometry);
            });
          }

          const geojson = this.assembleGeojson(featProps, geoms);

          if (!geojson) {
            this.setState({ canGoNext: false });
            return;
          }

          const geojsonBatches = this.batchGeoms(geojson);

          const geojsonSpec = {
            type: 'FeatureCollection',
            features: [],
          };

          const updatedGeoJSON = {
            type: 'FeatureCollection',
            features: [],
          };

          let sequentialPromises = Promise.resolve();
          let counter = 0;
          const getClippedGeoms = new Promise((resolve, reject) => {
            geojsonBatches.forEach(() => {
              sequentialPromises = sequentialPromises
                .then((result) => {
                  if (result) {
                    const resp = JSON.parse(result);
                    const localGeoJSON = resp.geojson;
                    if (localGeoJSON && localGeoJSON.features && localGeoJSON.features.length > 0) {
                      localGeoJSON.features.forEach((localFeat) => {
                        updatedGeoJSON.features.push(localFeat);
                      });
                    }
                  }

                  geojsonSpec.features = geojsonBatches[counter].features;
                  counter += 1;

                  return httpRequest.fetchJSON('/locations/gadm', { geojson: geojsonSpec });
                })
                .catch((err) => {
                  console.log('errr', err);
                  this.setState({
                    canGoNext: false,
                    isSaving: false,
                    dialogOpen: true,
                    dialogTitle: 'Clip-to-land Error',
                    dialogMessage: 'These features could not be modified. Upload has failed.',
                  });
                  reject(err);
                });
            });

            sequentialPromises
              .then((result) => {
                if (result) {
                  const resp = JSON.parse(result);
                  const localGeoJSON = resp.geojson;

                  if (localGeoJSON && localGeoJSON.features && localGeoJSON.features.length > 0) {
                    localGeoJSON.features.forEach((localFeat) => {
                      updatedGeoJSON.features.push(localFeat);
                    });
                  }
                }
                resolve(updatedGeoJSON);
              })
              .catch((err) => {
                console.log('errr', err);
                this.setState({
                  canGoNext: false,
                  isSaving: false,
                  dialogOpen: true,
                  dialogTitle: 'Clip-to-land Error',
                  dialogMessage: 'These features could not be modified. Upload has failed.',
                });
                reject(err);
              });
          });

          const uploadFeatureCount = geojson.features.length;

          getClippedGeoms.then((sequencedGeoJSON) => {
            this.calculateClippedArea(sequencedGeoJSON);
            const listName = selectedList === '' ? customList : selectedList;
            // Check if customList is the same name as an existing list
            const checkListExists = userLists.find(
              (list) => list.list_name.toLowerCase() === listName.toLowerCase()
            );

            if (sequencedGeoJSON.features.length !== uploadFeatureCount) {
              // We have lost landless features in the clip operation, stop the upload!
              this.displayUploadErrorDialog();
            } else if (checkListExists && selectedList === '') {
              this.setState({
                isSaving: false,
                dialogOpen: true,
                dialogTitle: 'List not created',
                dialogMessage:
                  'A list already exists with this name. Enter a new list name and click save.',
              });
            } else if (listName) {
              const request = new XMLHttpRequest();
              request.onload = () => {
                if (
                  request.responseText === saveListConfig.success ||
                  request.responseText === appendListConfig.success ||
                  request.responseText === saveAsDraftListConfig.success
                ) {
                  let dialogTitle;
                  let dialogMessage;
                  if (
                    request.responseText === saveListConfig.success ||
                    request.responseText === appendListConfig.success
                  ) {
                    dialogTitle = getDialogTitle(request.responseText, geoms.length);
                    dialogMessage = getDialogContent(
                      request.responseText,
                      listName,
                      isSaveAsDraft,
                      geoms.length
                    );
                  } else if (request.responseText === saveAsDraftListConfig.success) {
                    dialogTitle = getDialogTitle(saveListConfig.success, geoms.length);
                    dialogMessage = getDialogContent(
                      saveListConfig.success,
                      listName,
                      true,
                      geoms.length
                    );
                  }

                  const finalState = {
                    isSaving: false,
                    dialogOpen: true,
                    customList: listName,
                    dialogTitle,
                    dialogMessage,
                  };

                  this.setState(finalState);
                } else {
                  this.displayUploadErrorDialog();
                }
              };
              request.onerror = (err) => {
                this.setState({
                  isSaving: false,
                  dialogOpen: true,
                  dialogTitle: 'Locations not added',
                  dialogMessage: 'This list was not able to be added. Please review and try again.',
                });
                console.log(`Error: ${err}`);
              };

              let bigObj;
              if (selectedList === '' && isSaveAsDraft) {
                request.open('POST', saveAsDraftListConfig.route, true);

                bigObj = {
                  list_name: listName,
                  template_id: templateId,
                  geojson: sequencedGeoJSON,
                  custom_attributes: customAttributes,
                  location_classification:
                    locationClassifications.length === 0 ? '' : locationClassifications[0],
                  list_status_id: getListStatusIdByStatusName('Draft'),
                };

                if (isSaveAsDraft) {
                  gtag('event', 'Upload List', {
                    event_category: 'Submit',
                    event_label: 'User uploads a list with multiple locations as a draft',
                  });
                } else {
                  gtag('event', 'Upload List', {
                    event_category: 'Submit',
                    event_label: 'User uploads a list with multiple locations and submits',
                  });
                }
                gtag('event', 'upload locations save as draft button clicked', {
                  event_category: 'Locations Click',
                  event_label: `user saved as draft a list with a newly uploaded ${addType} location with a commodity type of ${activeTemplate}`,
                });
              } else if (selectedList === '') {
                request.open('POST', '/locations/addToNewList', true);

                bigObj = {
                  list_name: listName,
                  template_id: templateId,
                  geojson: sequencedGeoJSON,
                  custom_attributes: customAttributes,
                  location_classification:
                    locationClassifications.length === 0 ? '' : locationClassifications[0],
                  list_status_id: getListStatusId(isSaveAsDraft),
                  analysisIds: Object.values(analysisTypes),
                };

                if (isSaveAsDraft) {
                  gtag('event', 'Upload List', {
                    event_category: 'Submit',
                    event_label: 'User uploads a list with multiple locations as a draft',
                  });
                } else {
                  gtag('event', 'Upload List', {
                    event_category: 'Submit',
                    event_label: 'User uploads a list with multiple locations and submits',
                  });
                }
                gtag('event', 'upload locations save button clicked', {
                  event_category: 'Locations Click',
                  event_label: `user created a list with a newly uploaded ${addType} location with a commodity type of ${activeTemplate}`,
                });
              } else {
                const activeList = userLists.filter((list) => {
                  return list.list_name === listName;
                });

                if (activeList[0].list_locations_count + sequencedGeoJSON.features.length > 1500) {
                  this.setState({
                    isSaving: false,
                    dialogOpen: true,
                    dialogTitle: 'List exceeds maximum allowable size',
                    dialogMessage:
                      'Lists are limited to a maximum of 1,500 locations. Please cancel this edit and ensure your final list will contain no more than 1,500 locations.',
                  });
                  return;
                }
                request.open('POST', '/locations/updateExistingList', true);

                bigObj = {
                  list_id: activeList[0].id,
                  table_name: activeList[0].list_name,
                  geojson: sequencedGeoJSON,
                  appendLocations: true,
                  list_analysis_table_name: activeList[0].list_analysis_table_name,
                  list_status_id: getListStatusId(isSaveAsDraft),
                };
                gtag('event', 'Upload List', {
                  event_category: 'Submit',
                  event_label: 'User uploads a list with multiple locations and submits',
                });
                gtag('event', 'upload locations save button clicked', {
                  event_category: 'Locations Click',
                  event_label: `user uploaded ${addType} location to an existing list with a commodity type of ${activeTemplate}`,
                });
              }
              request.setRequestHeader('Content-Type', 'application/json');
              request.send(JSON.stringify(bigObj));
            }
          });
        });
      },
      0
    );

    this.setBannerCookie(isSaveAsDraft);
  };

  getStepThreeError = (features, uploadingData) => {
    if (!features.length) {
      return 'noLocationsSelected';
    }
    if (uploadingData.length) {
      let validated = true;
      for (let i = 0; i < uploadingData.length; i += 1) {
        if (!uploadingData[i].valid) {
          validated = false;
          break;
        }
      }
      return validated ? '' : 'locationsNotValidated';
    }
    return 'noLocationsSelected';
  };

  // Validates given step and
  // returns string for error message, or empty string if current step is valid.
  getStepError = (step) => {
    const { addType, commodityType, features, otherCommodityType, uploadingData } = this.state;

    if (step === 1) {
      if (!addType) {
        return 'addTypeRequired';
      }
      if (!commodityType) {
        return 'commodityTypeRequired';
      }
      return commodityType === 'other' && !otherCommodityType ? 'otherCommodityTypeRequired' : '';
    }
    if (step === 2) {
      return '';
    }
    if (step === 3) {
      return this.getStepThreeError(features, uploadingData);
    }
    return '';
  };

  next = () => {
    resetScroll();

    const { features, step, uploadingData } = this.state;

    const error = this.getStepError(step);

    if (!error) {
      if (step === 3 && features.length > uploadingData.length) {
        // Warn user before proceeding if not all locations are valid
        const message = locationsPage.add.errors.notAllLocationsValid;
        const invalid = features.length - uploadingData.length;
        const invalidLocationsMsg =
          invalid === 1 ? locationsPage.add.invalidLocation : locationsPage.add.invalidLocations;
        this.setState({
          canGoNext: true,
          dialogOpen: true,
          dialogTitle: message.title,
          dialogMessage: (
            <div>
              <p className="dialog__prompt">
                {invalid} {invalidLocationsMsg} {message.message}
              </p>
              <ul className="locations-uploading">
                <li className="locations-uploading__list-item--valid">
                  <IconCheck className="locations-uploading__icon" />
                  <span className="locations-uploading__label">
                    {uploadingData.length}{' '}
                    {uploadingData.length === 1
                      ? locationsPage.add.validLocation
                      : locationsPage.add.validLocations}
                  </span>
                </li>
                <li className="locations-uploading__list-item--invalid">
                  <IconExclamationTriangle className="locations-uploading__icon" />
                  <span className="locations-uploading__label">
                    {invalid} {invalidLocationsMsg}
                  </span>
                </li>
              </ul>
            </div>
          ),
        });
      } else {
        this.setState({
          canGoNext: true,
          showError: false,
        });
        this.toNextStep();
      }
      gtag('event', 'next step click', {
        event_category: 'Upload Locations Click',
        event_label: `user completed step ${step} of the upload locations workflow`,
      });
    } else {
      console.warn(`current step ${step} is not valid`);
      const dialogStrings = locationsPage.add.errors[error];
      if (dialogStrings) {
        this.setState({
          canGoNext: false,
          dialogOpen: true,
          dialogTitle: dialogStrings.title,
          dialogMessage: dialogStrings.message,
        });
      } else {
        console.warn('Validation error message not found for error ${error}');
        this.setState({ canGoNext: false });
      }
    }
  };

  resetFeatureResults = () => {
    this.setState({ features: [], featureResults: [], canGoNext: false });
  };

  updateCommodityType = (newType) => {
    const { addType, otherCommodityType } = this.state;
    if (addType !== 'investment') {
      const { templateOptions } = locationsPage.upload;
      if (newType in templateOptions) {
        store.dispatch(changeTemplate(newType));
      } else if (newType) {
        store.dispatch(changeTemplate('generic'));
      }
    } else {
      store.dispatch(changeTemplate(addType));
    }
    const canGoToStepTwo = newType === 'other' ? !!otherCommodityType : !!newType;
    this.setState({
      canGoNext: canGoToStepTwo,
      commodityType: newType,
      otherCommodityType: '',
      features: [],
      uploadingData: [],
      customAttributeHeaders: defaultCustomAttributeHeaders,
    });
  };

  updateOtherCommodityType = (newVal) => {
    this.setState({
      canGoNext: !!newVal,
      otherCommodityType: newVal,
      features: [],
      uploadingData: [],
      customAttributeHeaders: defaultCustomAttributeHeaders,
    });
  };

  addValidFeature = (feature) => {
    const { features, uploadingData, totalFeatures } = this.state;
    const validatedFeatures = this.getValidatedFeatures([feature]);
    const validatedFeature =
      validatedFeatures && validatedFeatures.length ? validatedFeatures[0] : null;
    const allFeatures = features.slice();
    if (validatedFeature) {
      allFeatures.push(validatedFeature);
    }

    if (!validatedFeature || !validatedFeature.valid) {
      this.setState({ features: allFeatures });
    } else {
      uploadingData.push(validatedFeature);
      this.setState({
        canGoNext: allFeatures.length === totalFeatures,
        features: allFeatures,
        uploadingData,
      });
    }
  };

  updateFeatures = (features) => {
    const validatedFeatures = this.getValidatedFeatures(features);
    const validFeatures = validatedFeatures.filter((feat) => {
      return feat.valid;
    });
    const error = this.getStepThreeError(features, validFeatures);
    this.setState({ canGoNext: !error, features: validatedFeatures, uploadingData: validFeatures });
  };

  setFeatures = (data) => {
    const { addType } = this.state;
    const { activeTemplate } = this.props;
    const features = data && data.length ? dataCleanup(data) : [];
    const requiresGeocode = activeTemplate === 'palmMill' && addType === 'commodity';
    this.geocodeMills(features, requiresGeocode);
  };

  geocodeMills = async (mills, requiresGeocode) => {
    const totalFeatures = mills.length;

    this.setState({
      canGoNext: false,
      totalFeatures,
      features: [],
      uploadingData: [],
    });

    if (requiresGeocode) {
      const requestConfig = {
        method: 'POST',
        url: `${DATA_API_URL}/dataApi/getPalmOilMillLatLong`,
        data: {
          palmOilMillIDs: mills.map((mill) => mill.ID),
        },
      };

      const { data: response = {} } = await axios(requestConfig).catch((err) => {
        console.log('Error getPalmOilMillLatLong:', err);
        return [];
      });
      const { data: millsLatLong = [] } = response;
      mills.forEach((feature, idx) => {
        const mill = { ...feature };
        const isLast = idx === totalFeatures - 1;
        const matchingLatLong = millsLatLong.find((millLatLong) => millLatLong.uml_id === mill.ID);
        if (matchingLatLong) {
          mill.Latitude = matchingLatLong.latitude;
          mill.Longitude = matchingLatLong.longitude;
          mill.invalidWriId = false;
        } else {
          mill.Latitude = 0;
          mill.Longitude = 0;
          mill.invalidWriId = true;
        }
        this.deduceAdmin(mill, isLast, idx);
      });
    } else {
      mills.forEach((feature, idx) => {
        const isLast = idx === totalFeatures - 1;
        this.deduceAdmin(feature, isLast, idx);
      });
    }
  };

  deduceAdmin = (feature, isLast, idx) => {
    const url = getGadmService();
    const queryProperties = {
      geometry: new Point({
        latitude: feature.properties ? feature.properties.Latitude : feature.Latitude,
        longitude: feature.properties ? feature.properties.Longitude : feature.Longitude,
      }),
      returnGeometry: false,
      outFields: ['gadmid', 'name_0', 'name_1', 'name_2'],
    };

    const promise =
      feature.Latitude || feature.properties
        ? new Promise((featResolve, featReject) =>
            setTimeout(() => {
              deduceAdminBackoff(esriQuery(url, queryProperties), 5, 200, featResolve, featReject);
            }, idx * 10)
          )
        : Promise.resolve({
            gadmid: 'None',
            Country: 'None',
            State: 'None',
            'Sub State': 'None',
          });

    try {
      promise.then((result) => {
        const feat = { ...feature, ...result };
        this.addValidFeature(feat);
        if (isLast) {
          this.setState({ isUploading: false });
        }
      });
    } catch (err) {
      console.log('Error', err);
      this.setState({
        canGoNext: false,
        dialogOpen: true,
        dialogTitle: 'Error Uploading',
        dialogMessage: 'Error in upload step.',
        isUploading: false,
      });
    }
  };

  updateSelected = (val) => {
    const newValue = val.value;
    this.setState({
      selectedList: newValue,
      customList: '',
      canGoNext: newValue !== '',
    });
  };

  updateCustomList = (name) => {
    this.setState({
      customList: name,
      selectedList: '',
      canGoNext: name !== '',
    });
  };

  generateMessages = (message, i) => {
    return <p key={`${i}_message`}>{message}</p>;
  };

  shouldCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  setUploading = (uploading) => {
    this.setState({ isUploading: uploading });
  };

  setBannerCookie = (isSaveAsDraft) => {
    // We have to update the banner here because information is otherwise lost as the state is updated later in this function
    // set a cookie to pass along desired banner
    const now = new Date();
    const cookieExpire = new Date();
    const fiveMinutes = 1000 * 60 * 5;
    cookieExpire.setTime(now.getTime() + fiveMinutes);

    const bannerContent = isSaveAsDraft
      ? 'List has been saved as a draft. Click “Submit” to submit the list for analysis and receive results.'
      : locationsPage.upload.successBanner;

    document.cookie = `LandingBannerContent=${bannerContent}; expires=${cookieExpire.toUTCString()}; path=/;`;
  };

  shouldRefresh = () => {
    resetScroll();
    this.setState({ isSaving: true });
    window.location.href = '/locations';
  };

  editTemplate = (evt, template) => {
    const { customAttributeHeaders } = this.state;
    const customAttributeHeadersClone = cloneDeep(customAttributeHeaders);
    if (template.template_datum_field_name === 'Attribute1') {
      customAttributeHeadersClone[0].custom = evt.target.value;
    } else if (template.template_datum_field_name === 'Attribute2') {
      customAttributeHeadersClone[1].custom = evt.target.value;
    } else if (template.template_datum_field_name === 'Attribute3') {
      customAttributeHeadersClone[2].custom = evt.target.value;
    }
    this.setState({ customAttributeHeaders: customAttributeHeadersClone });
  };

  generateEmailText = () => {
    return (
      <p key="email_message">
        If your issues continue, please email{' '}
        <a className="module-email-link" href="mailto:GFWPROsupport@wri.org">
          GFWPROsupport@wri.org
        </a>
      </p>
    );
  };

  setAddType = (addType) => {
    this.setState({ addType });
  };

  render() {
    const { view, activeTemplate, templateDropdowns, templateData, userLists, orgLists } =
      this.props;
    const {
      addType,
      selectedList,
      canGoNext,
      commodityType,
      customList,
      dialogOpen,
      dialogTitle,
      dialogMessage,
      dialogEmail,
      features,
      featureResults,
      isUploading,
      uploadingData,
      isSaving,
      otherCommodityType,
      step,
      customAttributeHeaders,
      showError,
    } = this.state;

    const dialogContent =
      dialogTitle === locationsPage.add.errors.notAllLocationsValid.title ||
      typeof dialogMessage === 'string'
        ? dialogMessage
        : dialogMessage.map(this.generateMessages);

    if (dialogEmail) {
      dialogContent.push(this.generateEmailText());
    }

    const defaultAction =
      dialogTitle === locationsPage.upload.doneMessageDoNotChangeThis ||
      dialogTitle === locationsPage.upload.noValidDoNotChangeThis ||
      dialogTitle === locationsPage.upload.locationsAddedDoNotChangeThis ||
      dialogTitle === saveListConfig.UploadLocationsSingleNewList.dialogTitle ||
      dialogTitle === saveListConfig.UploadLocationsMultipleNewList.dialogTitle
        ? [
            <div className="dialog__footer" data-button-action="shouldRefresh">
              <Button
                className="dialog__primary-action"
                label="OK"
                variant="primary"
                onClick={this.shouldRefresh}
              />
            </div>,
          ]
        : dialogTitle === locationsPage.add.errors.notAllLocationsValid.title
        ? [
            <div className="dialog__footer" data-button-action="toNextStep">
              <Button
                className="dialog__primary-action"
                label={locationsPage.add.yes}
                variant="primary"
                onClick={() => {
                  gtag('event', 'Save button clicked', {
                    event_category: 'Upload Locations Click',
                    event_label: 'User saves list with invalid locations',
                  });
                  this.toNextStep();
                  this.shouldCloseDialog();
                }}
              />
              <LinkButton label={locationsPage.add.cancel} onClick={this.shouldCloseDialog} />
            </div>,
          ]
        : [
            <div className="dialog__footer" data-button-action="shouldCloseDialog">
              <Button
                className="dialog__primary-action"
                label="OK"
                variant="primary"
                onClick={this.shouldCloseDialog}
              />
            </div>,
          ];

    return (
      <div className={`locations-body ${view === 'upload' ? '' : 'hidden'}`}>
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={step !== 4 ? this.shouldCloseDialog : null}
        >
          {dialogContent}
        </Dialog>

        <ModalLoader
          open={isSaving}
          showMessage={uploadingData && uploadingData.length > 49}
          header={loaderMessages.uploadHeader}
          message={loaderMessages.defaultMessage}
        />

        <section className="locations-multiupload flex-grid">
          <h1 className="locations-multiupload__title">{locationsPage.upload.stepTwoTitle}</h1>
          <aside className="side-panel">
            <Navigator step={step} setStep={this.setStep} />
          </aside>
          <section className="main-panel">
            <Switch>
              <Route path="/upload/step/1">
                <StepOne
                  updateCommodityType={this.updateCommodityType}
                  updateOtherCommodityType={this.updateOtherCommodityType}
                  commodityType={commodityType}
                  otherCommodityType={otherCommodityType}
                  activeTemplate={activeTemplate}
                  addType={addType}
                  setAddType={this.setAddType}
                />
              </Route>
              <Route path="/upload/step/2">
                <StepTwo
                  customAttributeHeaders={customAttributeHeaders}
                  editTemplate={this.editTemplate}
                  templateDropdowns={templateDropdowns}
                  templateData={templateData}
                  commodityType={commodityType}
                  activeTemplate={activeTemplate}
                  addType={addType}
                />
              </Route>
              <Route path="/upload/step/3">
                <StepThree
                  setUploading={this.setUploading}
                  isUploading={isUploading}
                  customAttributeHeaders={customAttributeHeaders}
                  templateData={templateData}
                  activeTemplate={activeTemplate}
                  addType={addType}
                  features={features}
                  setFeatures={this.setFeatures}
                  updateFeatures={this.updateFeatures}
                  resetFeatureResults={this.resetFeatureResults}
                  featureResults={featureResults}
                  commodityType={commodityType}
                  otherCommodityType={otherCommodityType}
                />
              </Route>
              <Route path="/upload/step/4">
                <StepFour
                  hideSelectList={false}
                  uploadingData={uploadingData}
                  templateData={templateData}
                  selectedList={selectedList}
                  customList={customList}
                  updateCustomList={this.updateCustomList}
                  updateSelected={this.updateSelected}
                  userLists={userLists}
                  activeTemplate={activeTemplate}
                  addType={addType}
                  commodityType={commodityType}
                  otherCommodityType={otherCommodityType}
                  orgLists={orgLists}
                />
              </Route>
            </Switch>
            <Route path="/upload/step">
              <section className="locations-multiupload-footer__wrapper">
                {step === 4 && <SaveAsDraftNote />}

                <div className="locations-multiupload-footer flex-grid space-between">
                  {showError ? (
                    <div className="validation-error">
                      Please make sure you have only selected valid data
                    </div>
                  ) : null}

                  <div className="locations-multiupload-footer__button-container">
                    {step !== 1 && (
                      <Button
                        className="locations-multiupload-footer__secondary"
                        variant="secondary"
                        onClick={this.toPrevStep}
                        label={locationsPage.add.prev}
                      />
                    )}

                    {step === 4 && (
                      <SaveAsDraftButtonWithDialog
                        disabled={!canGoNext}
                        saveLocations={() => this.saveLocations({ isSaveAsDraft: true })}
                      />
                    )}

                    <Button
                      className={`locations-multiupload-footer__primary ${
                        step === 4 ? 'hidden' : ''
                      }`}
                      variant="primary"
                      onClick={this.next}
                      disabled={!canGoNext}
                      label={locationsPage.add.next}
                    />

                    <Button
                      className={`locations-multiupload-footer__primary ${
                        step === 4 ? '' : 'hidden'
                      }
                    }`}
                      variant="primary"
                      onClick={isSaving ? null : this.saveLocations}
                      disabled={!canGoNext}
                      label={locationsPage.upload.submit}
                    />
                  </div>
                  <div className="cancel-upload-wizard">
                    <a href="/locations">{locationsPage.add.cancel}</a>
                  </div>
                </div>
              </section>
            </Route>
          </section>
        </section>
      </div>
    );
  }
}

export default withRouter(UploadLocations);
