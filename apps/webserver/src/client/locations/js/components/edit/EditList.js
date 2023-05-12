import React, { Component } from 'react';
import Deferred from 'dojo/Deferred';
import Dialog from 'material-ui/Dialog';

import store from '../../store';
import { changeView } from '../../actions/locationActions';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import StepOneEdit from './StepOneEdit';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import httpRequest from '../../../../common/js/utils/httpRequest';
import { discernPropValue } from '../../utils/moveLocations';
import { FailedPopupDialog } from '../landing/FailedPopupDialog';
import { locationsPage } from '../../../../common/js/config';
import { defaultCustomAttributeHeaders } from './table/MultiGridTable.config';
import '../../../css/locations.scss';

export default class EditList extends Component {
  constructor(props) {
    super(props);
    const { selectedLists, activeTemplate } = this.props;
    const { custom_attribute_names } = selectedLists[0];

    let customAttributeHeaders = defaultCustomAttributeHeaders;
    if (custom_attribute_names.length) {
      customAttributeHeaders = custom_attribute_names.split(',').map((custom, i) => ({
        field: `Attribute${i + 1}`,
        custom,
      }));
    }

    this.state = {
      commodityType: props.activeTemplate,
      accuracy: 'Very Confident',
      uploadingData: [],
      selectedList: 'Create New List',
      selectedListMove: 'Create New List',
      customList: activeTemplate,
      customAttributeHeaders,
      showError: false,
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      refreshPage: false,
      isLoading: false,
      listNotAccessible: false,
      edited: false,
    };

    require(['esri/geometry/support/webMercatorUtils'], (webMercatorUtils) => {
      this.WebMercatorUtils = webMercatorUtils;
    });
  }

  cancelAdd = () => {
    const list_id = this.props.selectedLists[0].id;
    httpRequest
      .fetchJSON('/locations/unlockList', { list_id })
      .then(() => {
        store.dispatch(changeView('lists'));
        const { history } = this.props;
        history.push('/lists');
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

  assembleGeojson = (featProps) => {
    const deferred = new Deferred();
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    const route = '/locations/getUserListLocationSpatialData';
    const body = {
      list_ids: [this.props.selectedLists[0].id],
    };

    httpRequest.fetchJSON(route, body).then((response) => {
      const { uploadingData } = this.state;
      const { selectedLocations } = this.props;

      const selectedListData = JSON.parse(response);
      if (selectedListData.errorCode === 604) {
        this.setState({
          isLoading: false,
          listNotAccessible: true,
        });
      } else {
        const feats = selectedListData[0].features;
        const filteredLocations = feats.filter((location) => {
          return selectedLocations.indexOf(location.properties.location_id) > -1;
        });

        filteredLocations.forEach((location, j) => {
          geojson.features.push({
            type: 'Feature',
            properties: featProps[j],
            geometry: location.geometry,
          });
        });

        deferred.resolve(geojson);
      }
    });

    return deferred;
  };

  isValid = () => {
    for (let i = 0; i < this.props.selectedLocationData.length; i++) {
      if (!this.props.selectedLocationData[i].valid) {
        return false;
      }
    }
    return true;
  };

  checkValid = () => {
    if (this.props.selectedLocationData.length > 0) {
      const validated = this.isValid();

      if (this.props.selectedLocationData.length > 1500) {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'List exceeds maximum allowable size',
          dialogMessage: locationsPage.oversizedUploadText,
        });
        return false;
      } else if (validated) {
        this.setState({
          showError: false,
        });
        return true;
      } else {
        this.setState({
          dialogOpen: true,
          showError: true,
          dialogTitle: 'Locations not validated',
          dialogMessage:
            'Please look for fields with validation errors. Hover the mouse over each field to see the error, and edit your locations to correct the issues before saving.',
        });
        return false;
      }
    } else if (this.props.selectedLocationData.length === 0) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'No Locations Selected',
        dialogMessage: 'You must select locations to update.',
      });
      return false;
    } else {
      this.setState({
        showError: false,
      });
      return true;
    }
    return false;
  };

  updateLocations = () => {
    if (!this.checkValid()) {
      return;
    }

    this.setState({
      isLoading: true,
    });
    const featProps = [];
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

      this.props.selectedLocationData.forEach((feature) => {
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
              properties[prop] = discernPropValue(feature, prop);
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

        featProps.push(properties);
      });
    } else {
      const template_name = 'Investment';

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

      this.props.selectedLocationData.forEach((feature) => {
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
              properties[prop] = discernPropValue(feature, prop);
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

        featProps.push(properties);
      });
    }

    this.assembleGeojson(featProps).then((geojson) => {
      const listName = this.props.selectedLists[0].list_name;
      if (listName) {
        const request = new XMLHttpRequest();
        request.onload = () => {
          let responseJSON;

          try {
            responseJSON = JSON.parse(request.responseText);

            if (responseJSON.success) {
              this.setState({
                dialogOpen: true,
                dialogTitle: 'Locations Edited',
                dialogMessage: 'You have successfully edited your location/s.',
                refreshPage: true,
                isLoading: false,
              });

              return;
            }
          } catch (error) {
            console.error(error);
          }

          if (request.responseText.includes('isLocked')) {
            this.setState({
              dialogOpen: true,
              dialogTitle: 'List is locked',
              dialogMessage:
                'The list that you have selected is currently being edited by another user. Please try again later',
              refreshPage: true,
              isLoading: false,
            });
          } else {
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Error in Locations',
              dialogMessage: 'This account request has failed. Please try again at another time.',
              refreshPage: true,
              isLoading: false,
            });
          }
        };
        request.onerror = (err) => {
          this.setState({
            dialogOpen: true,
            dialogTitle: 'Locations not edited',
            dialogMessage: 'This account request has failed on the server. Please try again at another time.',
            refreshPage: true,
            isLoading: false,
          });
          console.log(`Error: ${err}`);
        };

        const { activeTemplate } = this.props;
        const list_id = this.props.selectedLists[0].id;
        const location_ids = this.props.selectedLocationData.map((v) => v.location_id);
        const attributes = geojson.features.map((v) => v.properties);
        attributes.forEach((attribute) => delete attribute.list_id);
        const bigObj = {
          list_id,
          location_ids,
          activeTemplate,
          attributes,
        };
        request.open('POST', '/locations/editLocations', true);

        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(bigObj));
      }
    });
  };

  setFeatureResults = (uploadingData) => {
    this.setState({
      uploadingData: uploadingData,
    });
  };

  updateSelected = (val) => {
    this.setState({
      selectedList: val.value,
      selectedListMove: 'Create New List',
      customList: '',
    });
  };

  updateSelectedMove = (val) => {
    this.setState({
      selectedListMove: val.value,
      selectedList: 'Create New List',
      customList: '',
    });
  };

  updateCustom = (evt) => {
    this.setState({
      customList: evt.target.value,
      selectedList: 'Create New List',
      selectedListMove: 'Create New List',
    });
  };

  updateCustomList = (locationClassification) => {
    this.setState({
      customList: locationClassification,
      selectedList: 'Create New List',
      selectedListMove: 'Create New List',
    });
  };

  generateMessages = (message, i) => {
    return <p key={message + i}>{message}</p>;
  };

  showLoader = (isLoading) => {
    this.setState({
      isLoading: isLoading,
    });
  };

  setEdited = () => {
    this.setState({
      edited: true,
    });
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
    const {
      selectedList,
      customList,
      dialogOpen,
      dialogTitle,
      dialogMessage,
      selectedListMove,
      refreshPage,
      isLoading,
      listNotAccessible,
    } = this.state;
    const { selectedLists, selectedLocationData } = this.props;

    const dialogContent = typeof dialogMessage === 'string' ? dialogMessage : dialogMessage.map(this.generateMessages);

    const defaultAction = refreshPage
      ? [<Button variant="primary" label="OK" keyboardFocused={true} onClick={this.shouldRefresh} />]
      : [<Button label="OK" keyboardFocused={true} onClick={this.shouldCloseDialog} />];

    return (
      <div className={`locations-body ${this.props.view === 'edit' ? '' : 'hidden'}`}>
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={this.shouldCloseDialog}
        >
          {dialogContent}
        </Dialog>

        {listNotAccessible && (
          <FailedPopupDialog
            open={listNotAccessible}
            title={`${selectedLists[0].list_name} diagnostic failed to load.`}
            message={
              <p>
                Please select the list to try loading the diagnostic again. If diagnostic continue to fail, email{' '}
                <a className="popup__link" href="mailto:GFWPROsupport@wri.org">
                  GFWPROsupport@wri.org
                </a>{' '}
                for assistance.
              </p>
            }
            onRequestClose={() => this.setState({ listNotAccessible: !listNotAccessible })}
            onOkButtonPress={() => (window.location = '/locations')}
          />
        )}

        <ModalLoader open={isLoading} />

        <StepOneEdit
          setEdited={this.setEdited}
          accuracy={this.state.accuracy}
          customAttributeHeaders={this.state.customAttributeHeaders}
          templateData={this.props.templateData}
          features={selectedLocationData}
          activeTemplate={this.props.activeTemplate}
          addType={this.props.addType}
          commodityType={this.state.commodityType}
          selectedLists={this.props.selectedLists}
          view={this.props.view}
        />

        <section className="buttons-container">
          {this.state.showError ? (
            <div className="validation-error">Please make sure you have only selected valid data</div>
          ) : null}
          <Button
            variant="primary"
            onClick={this.updateLocations}
            disabled={!this.state.edited || !selectedLocationData.length || !this.isValid()}
            label="Update"
          />
          <LinkButton onClick={this.cancelAdd} label={locationsPage.add.cancel} />
        </section>
      </div>
    );
  }
}
