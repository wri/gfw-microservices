import { locationsPage } from '../../../../common/js/config';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import { fieldValidations } from '../../utils/validations';
import StepOneGFW from './StepOneGFW';
import StepTwoGFW from './StepTwoGFW';
import StepThreeGFW from './StepThreeGFW';
import GfwAccuracy from '../adding/GfwAccuracy';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import Polygon from 'esri/geometry/Polygon';
import Deferred from 'dojo/Deferred';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';
import React, { Component } from 'react';
import store from '../../store';
import { changeAddType, changeTemplate } from '../../actions/locationActions';
import Button from '../../../../common/js/components/Button';
import Dialog from 'material-ui/Dialog';
import GeometryEngine from 'esri/geometry/geometryEngine';
import httpRequest from '../../../../common/js/utils/httpRequest';
import { containsPunctuation } from '../../utils/lists.utils';
import { defaultCustomAttributeHeaders } from '../edit/table/MultiGridTable.config';
import '../../../css/locations.scss';

let originalState;

export default class AddGFW extends Component {
  constructor(props) {
    super(props);

    let commodityType = 'cattle';
    let customAttributeHeaders = defaultCustomAttributeHeaders;
    switch (props.selectedLists[0].list_name) {
      case 'RSPO Palm Concessions':
        commodityType = 'palmOil';
        break;
      case 'Oil Palm Concessions':
        commodityType = 'palmOil';
        break;
      case 'Palm Oil Mills':
        commodityType = 'palmOil';
        customAttributeHeaders = [
          { field: 'Attribute1', custom: 'Alternative Mill Name' },
          { field: 'Attribute2', custom: 'Group Name' },
          { field: 'Attribute3', custom: 'Attribute3' },
        ];
        store.dispatch(changeAddType('commodity'));
        store.dispatch(changeTemplate('palmMill'));
        break;
      case 'Protected Areas':
        customAttributeHeaders = [
          { field: 'Attribute1', custom: 'IUCN Category' },
          { field: 'Attribute2', custom: 'Designation Type' },
          { field: 'Attribute3', custom: 'Designation' },
        ];
        break;
      default:
    }
    this.state = {
      step: 1,
      commodityType: commodityType,
      otherCommodityType: '',
      accuracy: 'Very Confident',
      features: [],
      featureResults: [],
      uploadingData: [],
      selectedList: 'Create New List',
      customList: this.props.activeTemplate,
      customAttributeHeaders: customAttributeHeaders,
      showError: false,
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      refreshPage: false,
      isSaving: false,
    };

    originalState = this.state;

    require(['esri/geometry/support/webMercatorUtils'], (webMercatorUtils) => {
      this.WebMercatorUtils = webMercatorUtils;
    });
  }

  cancelAdd = () => {
    // this.setState({
    //   step: 1,
    //   showError: false
    // });
    // store.dispatch(changeView('landing'));
    const list_id = this.props.selectedLists[0].id;
    httpRequest
      .fetchJSON('/unlockList', { list_id })
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Error in Locations',
          dialogMessage: 'There was an error with unlocking a list.',
          refreshPage: true,
        });
      });
  };

  /**
   * @function assembleGeojson
   *
   * @param {Array} featProps Properties that need to be merged with the geometries
   * @param {Array} geometries Geometries of the polygons that will be analyzed
   * @summary Merges geometries and properties together to form a geojson
   */
  assembleGeojson = (featProps, geometries) => {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    geometries.features.forEach((feature) => {
      const property = featProps.find((prop) => {
        return prop.location_id === feature.properties.location_id;
      });

      // Removing temporary location_id that was used to map with geoms
      delete property.location_id;

      geojson.features.push({
        type: 'Feature',
        properties: property,
        geometry: feature.geometry,
      });
      const esriJson = geojsonUtil.geojsonToArcGIS(feature);
      const esriGeometry = new Polygon({
        rings: esriJson.geometry.rings,
        spatialReference: {
          wkid: 4326,
        },
      });

      const area = GeometryEngine.geodesicArea(esriGeometry, 'hectares');
      geojson.features[geojson.features.length - 1].properties['Analysis Area'] = area;
      if (!geojson.features[geojson.features.length - 1].properties['Analysis Radius']) {
        geojson.features[geojson.features.length - 1].properties['Analysis Radius'] = 0;
      }
    });

    return geojson;
  };

  discernPropValue = (feature, prop) => {
    let propValue = feature[prop];
    if (prop === 'Accuracy Rating of Location Entered') {
      if (typeof propValue !== 'undefined' && propValue.toLowerCase) {
        switch (propValue.toLowerCase()) {
          case "don't know":
            propValue = 0;
            break;
          case 'dont know':
            propValue = 0;
            break;
          case 'not confident':
            propValue = 1;
            break;
          case 'moderately confident':
            propValue = 2;
            break;
          case 'very confident':
            propValue = 3;
            break;
          default:
            propValue = 0;
        }
      } else {
        propValue = 0;
      }
    } else if (prop === 'Size of Investment') {
      if (propValue === '') {
        propValue = null;
      }
    }

    return propValue;
  };

  getGFWListLocationGeom = (list_id, location_ids) => {
    const deferred = new Deferred();
    httpRequest
      .fetchForm('/locations/getGFWListLocationGeom', `list_id=${list_id}&location_ids=${location_ids}`)
      .then((response) => {
        const geometries = JSON.parse(response);
        deferred.resolve(geometries);
      })
      .catch((err) => {
        console.log('error with grabbing gfw location data', err);
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Error in Geometry Retrieval',
          dialogMessage: 'This account request has failed on the server. Please try again at another time.',
          isSaving: false,
          refreshPage: true,
        });
        deferred.resolve(false);
      });

    return deferred;
  };

  saveLocations = () => {
    this.setState({ isSaving: true });

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
        isSaving: false,
        refreshPage: false,
      });
      return;
    } else if (checkListExists && this.state.selectedList === 'Create New List') {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'List not created',
        dialogMessage: 'A list already exists with this name. Enter a new list name and click save.',
        isSaving: false,
        refreshPage: false,
      });
      return;
    } else if (checkForPunctuation && this.state.selectedList === 'Create New List') {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Invalid List Name',
        dialogMessage:
          'The list name chosen contains punctuation. Please choose a list name with only letters, numbers, and/or spaces.',
        isSaving: false,
        refreshPage: false,
      });
      return;
    }

    const featProps = [],
      ids = [];
    let templateId;
    const customAttributes = [];

    if (this.props.addType === 'commodity') {
      let active = this.props.activeTemplate;

      if (active === 'investment') {
        if (this.state.commodityType === 'palmOil') {
          active = 'palmGeneric';
        } else if (this.state.commodityType === 'soy') {
          active = 'soyGeneric';
        } else if (this.state.commodityType === 'cattle') {
          active = 'cattleGeneric';
        } else if (this.state.commodityType === 'cocoa') {
          active = 'cocoaGeneric';
        }
      }
      const template_name = deduceActiveName(active);

      const activeTemplates = [];
      const customAttributeNames = [];

      this.props.templateData.forEach((template) => {
        if (template.template_name === template_name) {
          if (template.template_datum_field_name === 'Attribute1') {
            if (this.state.customAttributeHeaders[0].custom !== 'Attribute1') {
              template.template_datum_field_name_updated = this.state.customAttributeHeaders[0].custom;
              customAttributeNames.push(template.template_datum_field_name_updated);
            }
          } else if (template.template_datum_field_name === 'Attribute2') {
            if (this.state.customAttributeHeaders[1].custom !== 'Attribute2') {
              template.template_datum_field_name_updated = this.state.customAttributeHeaders[1].custom;
              customAttributeNames.push(template.template_datum_field_name_updated);
            }
          } else if (template.template_datum_field_name === 'Attribute3') {
            if (this.state.customAttributeHeaders[2].custom !== 'Attribute3') {
              template.template_datum_field_name_updated = this.state.customAttributeHeaders[2].custom;
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

      this.state.uploadingData.forEach((feature) => {
        const properties = {};
        Object.keys(feature).forEach((prop) => {
          if (
            prop !== 'checked' &&
            prop !== 'valid' &&
            prop !== 'Attribute1' &&
            prop !== 'Attribute2' &&
            prop !== 'Attribute3' &&
            prop !== 'invalidFields' &&
            prop !== 'type' &&
            prop !== 'geometry'
          ) {
            if (customAttributeNames.indexOf(prop) > -1) {
              //it is a custom attribute
              properties[prop] = feature[prop];
            } else if (genericFields.indexOf(prop) > -1) {
              //it is a normal, expected attribute of this template
              properties[prop] = this.discernPropValue(feature, prop);
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
        properties.Size = feature.Size;
        properties.location_id = feature.location_id;

        featProps.push(properties);
        ids.push(feature.location_id);
      });
    } else {
      const activeTemplates = this.props.templateData.filter((template) => {
        return template.template_name === 'Investment';
      });

      templateId = activeTemplates[0].template_id;

      this.state.uploadingData.forEach((feature) => {
        const properties = {};

        Object.keys(feature).forEach((prop) => {
          if (
            prop !== 'checked' &&
            prop !== 'valid' &&
            prop !== 'invalidFields' &&
            prop !== 'type' &&
            prop !== 'geometry'
          ) {
            properties[prop] = this.discernPropValue(feature, prop);
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
        properties.location_id = feature.location_id;

        properties['Analysis Radius'] = '0';

        featProps.push(properties);
        ids.push(feature.location_id);
      });
    }

    this.getGFWListLocationGeom(this.props.selectedLists[0].id, ids)
      .then((geoms) => {
        const geojson = this.assembleGeojson(featProps, geoms);

        if (listName) {
          const request = new XMLHttpRequest();
          request.onload = () => {
            if (request.responseText === 'LocationAdded') {
              const newState = originalState;
              newState.step = 3;
              newState.dialogOpen = true;
              newState.dialogTitle = 'Done';
              newState.dialogMessage = 'You have successfully uploaded your locations to a list.';
              newState.refreshPage = true;
              newState.isSaving = false;
              newState.customList = listName;
              this.setState(newState);
            } else if (request.responseText === 'LocationAppended') {
              const newState = originalState;
              newState.step = 3;
              newState.dialogOpen = true;
              newState.dialogTitle = 'Locations Appended';
              newState.dialogMessage = 'You have successfully added locations to an existing list.';
              newState.refreshPage = true;
              newState.isSaving = false;
              this.setState(newState);
            } else {
              this.setState({
                dialogOpen: true,
                dialogTitle: 'Error in Locations',
                dialogMessage: 'This account request has failed. Please try again at another time.',
                isSaving: false,
                refreshPage: true,
              });
            }
          };

          request.onerror = (err) => {
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Error in Locations',
              dialogMessage: 'This account request has failed on the server. Please try again at another time.',
              isSaving: false,
              refreshPage: true,
            });
            console.log(`Error: ${err}`);
          };

          let bigObj;
          // TODO: we're deleting these properties so that the backend call doesn't throw an error.
          // Version 1.1 - we need to add the flag properties back in
          geojson.features.forEach((feature) => {
            delete feature.properties.list_id;
            delete feature.properties.location_id;
            delete feature.properties.flag_forma;
            delete feature.properties.flag_general;
            delete feature.properties.flag_glad;
            delete feature.properties.flag_gran_chaco;
            delete feature.properties.flag_terrai;
            delete feature.properties.flag_viirs;
          });

          const [gfwList] = this.props.selectedLists;
          const { id: gfwListId } = gfwList;

          if (this.state.customList !== '' && this.state.selectedList === 'Create New List') {
            request.open('POST', '/locations/addToNewList', true);
            const list_id = this.props.selectedLists[0].id;
            // rspo, pom, and opc need to have palm analysis if commodity type - their location classification must be a supply shed

            let location_classification;
            if (gfwListId === 1) {
              // GFW List
              // id = 1: Administrative Areas
              location_classification = 'Administrative Area';
            } else {
              // GFW Lists
              // id = 2: Oil Palm Concessions
              // id = 3: Palm Oil Mills
              // id = 4: Protected Areas
              // id = 5: RSPO Palm Concessions
              location_classification = 'Supply Shed';
            }

            bigObj = {
              list_id: list_id,
              list_name: listName,
              template_id: templateId,
              geojson: geojson,
              custom_attributes: customAttributes,
              location_classification,
              gfw_list_id: gfwListId,
            };
          } else if (this.state.customList === '' && this.state.selectedList !== 'Create New List') {
            request.open('POST', '/locations/updateExistingList', true);
            const activeList = this.props.userLists.filter((list) => {
              return list.list_name === listName;
            });

            if (activeList[0].list_locations_count + geojson.features.length > 1500) {
              this.setState({
                dialogOpen: true,
                dialogTitle: 'List exceeds maximum allowable size',
                dialogMessage: locationsPage.oversizedUploadText,
                isSaving: false,
                refreshPage: false,
              });
              return;
            }

            bigObj = {
              list_id: activeList[0].id,
              table_name: activeList[0].list_name,
              geojson: geojson,
              gfw_list_id: gfwListId,
              appendLocations: true,
              list_analysis_table_name: activeList[0].list_analysis_table_name,
            };
          }
          request.setRequestHeader('Content-Type', 'application/json');
          request.send(JSON.stringify(bigObj));
        }
      })
      .catch((err) => {
        this.setState({ isSaving: false });
        console.log('err', err);
      });
    ga('send', 'event', 'Add GFW Click', 'Next button clicked', 'user completed step 3 of add from gfw list workflow');
  };

  updateOtherCommodityType = (evt) => {
    this.setState({ otherCommodityType: evt.target.value });
  };

  updateCommodityType = (evt) => {
    if (this.props.addType !== 'investment') {
      switch (evt.target.value) {
        case 'cattle':
          store.dispatch(changeTemplate('cattleGeneric'));
          break;
        case 'palmOil':
          store.dispatch(changeTemplate('palmGeneric'));
          break;
        case 'soy':
          store.dispatch(changeTemplate('soyGeneric'));
          break;
        case 'cocoa':
          store.dispatch(changeTemplate('cocoaGeneric'));
          break;
        default:
          store.dispatch(changeTemplate('generic'));
          break;
      }
    }
    this.setState({ commodityType: evt.target.value });
  };

  updateAccuracy = (evt) => {
    this.setState({ accuracy: evt.target.value });
  };

  next = () => {
    window.scrollTo(0, 0);
    //TODO: Add checks for certain steps before we can go on
    if (this.state.step === 2 && this.state.uploadingData && this.state.uploadingData.length > 0) {
      const validArray = [];
      let validated = true;
      for (let i = 0; i < this.state.uploadingData.length; i++) {
        if (!this.state.uploadingData[i].valid) {
          validated = false;
          this.state.uploadingData[i].invalidFields.forEach((field) => {
            if (field.toLowerCase() === 'certification') {
              if (validArray.indexOf(fieldValidations[field].certObj[this.props.activeTemplate]) === -1) {
                validArray.push(fieldValidations[field].certObj[this.props.activeTemplate]);
              }
            } else {
              if (validArray.indexOf(fieldValidations[field].text) === -1) {
                validArray.push(fieldValidations[field].text);
              }
            }
          });
        }
      }

      if (!!this.state.uploadingData && this.state.uploadingData.length > 1500) {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'List exceeds maximum allowable size',
          dialogMessage: locationsPage.oversizedUploadText,
        });
      } else if (validated) {
        this.setState({
          step: this.state.step + 1,
          showError: false,
        });
      } else if (this.state.step === 2) {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Locations not validated',
          dialogMessage:
            'Please return to Step 2 and look for fields with validation errors. Hover the mouse over each field to see the error, and edit your locations to correct the issues before advancing to Step 3.',
        });
      } else {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Locations Not Added - Please ensure all submitted fields are valid:',
          dialogMessage: validArray,
        });
      }
      ga(
        'send',
        'event',
        'Add GFW Click',
        'Next button clicked',
        'user completed step 2 of add from gfw list workflow'
      );
    } else if (this.state.step === 2 && !!this.state.uploadingData && this.state.uploadingData.length === 0) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'No Locations Selected',
        dialogMessage: 'You must select locations to upload.',
      });
    } else {
      if (this.state.step === 1) {
        this.addAdditonalValues();
        ga(
          'send',
          'event',
          'Add GFW Click',
          'Next button clicked',
          'user completed step 1 of add from gfw list workflow'
        );
      }
      this.setState({ step: this.state.step + 1 });
    }
  };

  addAdditonalValues = () => {
    const { filteredData, selectedLocations, listData } = this.props;
    const filteredLocationData = listData.filter((listD) => filteredData.indexOf(listD.location_id) > -1);
    const features =
      filteredLocationData.length > 0
        ? filteredLocationData.filter((feat) => selectedLocations.indexOf(feat.location_id) > -1)
        : [];
    features.forEach((location) => {
      location['Accuracy Rating of Location Entered'] = this.state.accuracy;
      if (this.props.selectedLists[0].list_name === 'Administrative Areas') {
        const fieldName = this.props.addType === 'investment' ? 'Investment Name' : 'Location Name';
        if (location['Sub State']) {
          location[fieldName] = location['Sub State'];
        } else if (location.State) {
          location[fieldName] = location.State;
        } else {
          location[fieldName] = location.Country;
        }
      }
    });
  };

  setFeatureResults = (features, uploadingData) => {
    this.setState({
      featureResults: features,
      uploadingData: uploadingData,
    });
  };

  updateSelected = (val) => {
    this.setState({
      selectedList: val.value,
      customList: '',
    });
  };

  updateCustom = (evt) => {
    this.setState({
      customList: evt.target.value,
      selectedList: 'Create New List',
    });
  };

  updateCustomList = (locationClassification) => {
    this.setState({
      customList: locationClassification,
      selectedList: 'Create New List',
    });
  };

  generateMessages = (message, i) => {
    return <p key={message + i}>{message}</p>;
  };

  shouldCloseDialog = () => {
    this.setState({
      dialogOpen: false,
      refreshPage: false,
    });
  };

  shouldRefresh = () => {
    window.location.reload();
  };

  render() {
    const { selectedList, customList, dialogOpen, dialogTitle, dialogMessage, refreshPage, isSaving } = this.state;
    const { filteredData, selectedLocations, listData, currentUser } = this.props;
    const filteredLocationData = listData.filter((listD) => filteredData.indexOf(listD.location_id) > -1);
    const features =
      filteredLocationData.length > 0
        ? filteredLocationData.filter((feat) => selectedLocations.indexOf(feat.location_id) > -1)
        : [];

    const [currentList] = this.props.selectedLists;
    const listName = currentList && currentList.list_name;
    let editFields = this.props.templateData;

    switch (listName) {
      case 'Administrative Areas':
      case 'Protected Areas':
        editFields = this.props.templateData.filter((t) => {
          const fieldName = t.template_datum_field_name;

          return fieldName !== 'Analysis Area' && fieldName !== 'Analysis Radius' && fieldName !== 'gadmid';
        });
        break;
      default:
        break;
    }

    const dialogContent = typeof dialogMessage === 'string' ? dialogMessage : dialogMessage.map(this.generateMessages);

    const defaultAction = refreshPage
      ? [<Button variant="primary" label="OK" keyboardFocused={true} onClick={this.shouldRefresh} />]
      : [<Button variant="primary" label="OK" keyboardFocused={true} onClick={this.shouldCloseDialog} />];

    return (
      <div className={`locations-body ${this.props.view === 'gfw' ? '' : 'hidden'}`}>
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={this.state.step !== 2 ? this.shouldCloseDialog : null}
        >
          {dialogContent}
        </Dialog>
        <ModalLoader open={isSaving} />
        <StepOneGFW
          updateCommodityType={this.updateCommodityType}
          updateOtherCommodityType={this.updateOtherCommodityType}
          commodityType={this.state.commodityType}
          otherCommodityType={this.state.otherCommodityType}
          activeTemplate={this.props.activeTemplate}
          addType={this.props.addType}
          step={this.state.step}
          selectedLists={this.props.selectedLists}
        />
        {this.state.step === 2 && (
          <StepTwoGFW
            accuracy={this.state.accuracy}
            editFields={editFields}
            customAttributeHeaders={this.state.customAttributeHeaders}
            templateData={this.props.templateData}
            features={features}
            activeTemplate={this.props.activeTemplate}
            addType={this.props.addType}
            step={this.state.step}
            setFeatureResults={this.setFeatureResults}
            featureResults={this.state.featureResults}
            commodityType={this.state.commodityType}
            otherCommodityType={this.state.otherCommodityType}
            selectedLists={this.props.selectedLists}
            view={this.props.view}
          />
        )}
        <StepThreeGFW
          selectedList={selectedList}
          customList={customList}
          updateCustomList={this.updateCustomList}
          updateSelected={this.updateSelected}
          step={this.state.step}
          userLists={this.props.userLists}
          activeTemplate={this.props.activeTemplate}
          addType={this.props.addType}
          commodityType={this.state.commodityType}
          orgLists={this.props.orgLists}
          updateCustom={this.updateCustom}
          selectedLists={this.props.selectedLists}
          otherCommodityType={this.state.otherCommodityType}
        />
        <GfwAccuracy
          hidden={this.state.step !== 1}
          accuracy={this.state.accuracy}
          updateAccuracy={this.updateAccuracy}
        />
        <section className="buttons-container flex-grid space-between">
          <Button variant="primary" onClick={this.cancelAdd} label={locationsPage.add.cancel} />
          {this.state.showError ? (
            <div className="validation-error">Please make sure you have only selected valid data</div>
          ) : null}
          <div>
            <Button
              className={`${this.state.step === 3 ? 'hidden' : ''}`}
              onClick={this.next}
              disabled={currentUser.access_level_id === 3 ? true : false}
              label={locationsPage.add.next}
            />
            <Button
              variant="primary"
              className={`${this.state.step === 3 ? '' : 'hidden'}`}
              onClick={this.saveLocations}
              disabled={currentUser.access_level_id === 3 ? true : false}
              label="Save"
            />
          </div>
        </section>
      </div>
    );
  }
}
