import React, { Component } from 'react';

import { fieldValidations } from '../../../../locations/js/utils/validations';
import { locationsPage } from '../../../../common/js/config';
import downloaders from '../../../../common/js/utils/downloaders';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import MultiGridTable from './table/MultiGridTable';
import Button from '../../../../common/js/components/Button';
import { _getFeatures } from './table/MultiGridTable.util';
import { isDownloadDisabledForThisList } from '../../../../locations/js/utils/lists.utils';
import { handleStepOneEditFeatures } from './StepOneEdit.util';
import { getIsDiagnosticStatusDraft } from '../../utils/draft.utils';
import CustomTooltip from '../../../../common/js/components/CustomTooltip/CustomTooltip';
import { EXCLUDED_COLUMNS } from '../../../../common/js/constants/lists.constants';

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
  generic: { value: 'Property', commodity: 'Generic' },
  other: { value: 'Supply Shed', commodity: 'Other' },
  pulp: { value: 'Property', commodity: 'Other' },
  cocoaGeneric: { value: 'Property', commodity: 'Cocoa' },
};

export default class StepOneEdit extends Component {
  editingTable = true;

  constructor(props) {
    super(props);

    const { features, addType, activeTemplate } = this.props;

    for (let i = 0; i < features.length; i++) {
      features[i].checked = false;
      features[i].valid = true;
      features[i].invalidFields = [];

      if (addType === 'commodity') {
        features[i]['Location Classification'] = features[i]['Location Classification']
          ? features[i]['Location Classification']
          : classificationObj[activeTemplate].value;
      }

      const analysisFields = {
        'Analysis Radius': '',
        'Analysis Area': '',
      };
      for (const key in features[i]) {
        if (key === 'Analysis Radius' || key === 'Analysis Area') {
          analysisFields[key] = features[i][key];
        }
        if (key.toLowerCase() === 'start date') {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(features[i][key], features[i]['End Date']) === false) {
              features[i].valid = false;
              features[i].invalidFields.push(key);
            }
          });
        } else if (key.toLowerCase() === 'certification') {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(features[i][key], activeTemplate) === false) {
              features[i].valid = false;
              features[i].invalidFields.push(key);
            }
          });
        } else if (key.toLowerCase() === 'rspo model') {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(features[i][key], activeTemplate) === false) {
              features[i].valid = false;
              features[i].invalidFields.push(key);
            }
          });
        } else if (key.toLowerCase() === 'company id') {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(features[i][key], activeTemplate) === false) {
              features[i].valid = false;
              features[i].invalidFields.push(key);
            }
          });
        } else if (key.toLowerCase() === 'id' && activeTemplate === 'palmMill') {
          if (features[i].invalidWriId) {
            features[i].valid = false;
          }
        } else if (
          key !== 'valid' &&
          key !== 'checked' &&
          key !== 'Analysis Radius' &&
          key !== 'Analysis Area' &&
          key !== 'invalidFields' &&
          key.toLowerCase() !== 'company id' &&
          fieldValidations[key]
        ) {
          fieldValidations[key].validations.forEach((validation) => {
            if (validation(features[i][key]) === false) {
              features[i].valid = false;
              features[i].invalidFields.push(key);
            }
          });
        }
      }

      if (analysisFields['Analysis Radius'] === '' && analysisFields['Analysis Area'] === '') {
        features[i].valid = false;
        features[i].invalidFields.push('Analysis Radius');
        features[i].invalidFields.push('Analysis Area');
      }
    }

    this.state = {
      showValidated: 'all',
      disableNext: true,
      features: props.features,
      filteredFeatures: props.features,
    };
  }

  toggleValidated = (evt) => {
    this.setState({
      showValidated: evt.target.value,
      filteredFeatures: _getFeatures(this.state.features, evt.target.value),
    });
  };

  filterFeatures = () => {
    this.setState({
      filteredFeatures: _getFeatures(this.state.features, this.state.showValidated),
    });
  };

  editTableCell = (value, feature, singleKey, target) => {
    const { features, setEdited, activeTemplate } = this.props;

    features.forEach((item, index) => {
      if (item['location_id'] === feature['location_id']) {
        const newFeaturesState = features.slice();
        let valid = true;
        newFeaturesState[index][singleKey] = value;
        newFeaturesState[index].invalidFields = [];

        for (const key in feature) {
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
              feature.valid = false;
              newFeaturesState[index].invalidFields.push(key);
            }
          } else if (fieldValidations[key] && key.toLowerCase() !== 'company id') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key]) === false) {
                valid = false;
                newFeaturesState[index].invalidFields.push(key);
              }
            });
          } else if (fieldValidations[key] && key.toLowerCase() !== 'volume') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key]) === false) {
                valid = false;
                newFeaturesState[index].invalidFields.push(key);
              }
            });
          }
        }

        newFeaturesState[index].valid = valid;

        this.setState({
          features: newFeaturesState,
        });
        setEdited();
      }
    });
  };

  downloadCsv = () => {
    const { templateData, activeTemplate, features, addType, selectedLists } = this.props;
    const isListExcluded = isDownloadDisabledForThisList(selectedLists[0]);
    const template_name =
      activeTemplate === 'investment' ? 'Investment' : deduceActiveName(activeTemplate);
    const properFields = templateData
      .filter((dbTemplate) => dbTemplate.template_name === template_name)
      .map((template) => template.template_datum_field_name)
      .filter((fieldName) => !(isListExcluded && EXCLUDED_COLUMNS.includes(fieldName)));
    const csvData = [[]];

    const processedFeatures = handleStepOneEditFeatures(features);
    for (const key in processedFeatures[0]) {
      if (properFields.indexOf(key) > -1 && key !== 'gadmid') {
        if (addType === 'commodity') {
          if (key !== 'Wind Barrier' && key !== 'Riparian Buffers' && key !== 'Buffer Zones') {
            csvData[0].push(key);
          }
        } else {
          csvData[0].push(key);
        }
      }
    }

    processedFeatures.forEach((feature) => {
      const dataRow = [];

      for (const key in feature) {
        if (properFields.indexOf(key) > -1 && key !== 'gadmid') {
          if (addType === 'commodity') {
            if (key !== 'Wind Barrier' && key !== 'Riparian Buffers' && key !== 'Buffer Zones') {
              dataRow.push(
                feature[key] && feature[key].includes && feature[key].includes(',')
                  ? `"${feature[key]}"`
                  : key === 'Accuracy Rating of Location Entered'
                  ? this.parseAccuracy(feature[key])
                  : feature[key]
              );
            }
          } else {
            dataRow.push(
              feature[key] && feature[key].includes && feature[key].includes(',')
                ? `"${feature[key]}"`
                : key === 'Accuracy Rating of Location Entered'
                ? this.parseAccuracy(feature[key])
                : feature[key]
            );
          }
        }
      }

      csvData.push(dataRow);
    });

    downloaders.downloadCSV(csvData);
  };

  parseAccuracy = (accuracy) => {
    let acc = "Don't Know";
    switch (accuracy) {
      case 3:
        acc = 'Very Confident';
        break;
      case 2:
        acc = 'Moderately Confident';
        break;
      case 1:
        acc = 'Not Confident';
        break;
    }

    return acc;
  };

  render() {
    const { selectedLists } = this.props;
    const listName = selectedLists[0] ? selectedLists[0].list_name : '';
    const isListExcluded = isDownloadDisabledForThisList(selectedLists[0]);
    const TOOLTIP__MESSAGE =
      'This list contains unanalyzed locations. Please click the submit button to run analysis. Once submitted, your list will not be accessible until analysis is complete.';

    return (
      <div className="edit-step">
        <h1 style={{ display: 'flex', alignItems: 'center' }} className="edit-step__title">
          {`Edit ${listName} List`}
          {getIsDiagnosticStatusDraft(selectedLists[0]) && (
            <div style={{ marginLeft: 10, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CustomTooltip
                iconWidth={14}
                iconHeight={19}
                placement={'top'}
                label={'DRAFT'}
                tooltipMessage={TOOLTIP__MESSAGE}
              />
            </div>
          )}
        </h1>

        <div className="table-controls-container flex-grid space-between">
          <div className="table-controls-container__view-toggle flex-grid align-center">
            <span className="label">{locationsPage.upload.show}:</span>
            <input
              type="radio"
              id="editAnyRadio"
              value="all"
              name="edit-any-validate"
              checked={this.state.showValidated === 'all'}
              onChange={this.toggleValidated}
            />
            <label htmlFor="editAnyRadio" className="locations-select-type-label">
              {locationsPage.upload.showAllValidated}
            </label>
            <input
              type="radio"
              id="editValidateRadio"
              name="edit-validate"
              value="valid"
              checked={this.state.showValidated === 'valid'}
              onChange={this.toggleValidated}
            />
            <label htmlFor="editValidateRadio" className="locations-select-type-label">
              {locationsPage.upload.showValidated}
            </label>
            <input
              type="radio"
              id="editNoValidateRadio"
              value="invalid"
              name="edit-no-validate"
              checked={this.state.showValidated === 'invalid'}
              onChange={this.toggleValidated}
            />
            <label htmlFor="editNoValidateRadio" className="locations-select-type-label">
              {locationsPage.upload.showNotValidated}
            </label>
          </div>

          <Button
            className="locations-diagnostics-icon-holder"
            label={locationsPage.upload.stepThree.download}
            onClick={this.downloadCsv}
            size="small"
          />
        </div>

        <div className="gfw-table step-one-edit-table-container">
          <MultiGridTable
            addType={this.props.addType}
            activeTemplate={this.props.activeTemplate}
            commodityType={this.props.commodityType}
            customAttributeHeaders={this.props.customAttributeHeaders}
            editingTable={this.editingTable}
            features={this.state.filteredFeatures}
            initialColumnIsValid={true}
            templateData={this.props.templateData}
            isListExcluded={isListExcluded}
            // methods
            _editTableCell={this.editTableCell}
            _filterFeatures={this.filterFeatures}
          />
        </div>
      </div>
    );
  }
}
