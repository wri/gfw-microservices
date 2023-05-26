/* eslint-disable no-loop-func */
// import {changeAddType} from 'locations/js/actions/locationActions';
import { fieldValidations } from '../../utils/validations';
import { locationsPage } from '../../../../common/js/config';
import downloaders from '../../../../common/js/utils/downloaders';
// import store from '../../../../locations/js/store';
import React, { Component } from 'react';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';
import all from 'dojo/promise/all';
import Deferred from 'dojo/Deferred';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import { GFWLists } from '../../config/listNames';
import MultiGridTable from '../edit/table/MultiGridTable';
import { _getFeatures } from '../edit/table/MultiGridTable.util';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import { isDownloadDisabledForThisList } from '../../utils/lists.utils';
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
  // other: {value: 'Supply Shed', commodity: 'Other'},
  cocoaGeneric: { value: 'Property', commodity: 'Cocoa' },
  palmOil: { value: 'Supply Shed', commodity: 'Palm Oil' },
};

const unTouchables = {
  shared: [
    'Country',
    'State',
    'Sub State',
    'Latitude',
    'Longitude',
    'Commodity',
    'Accuracy Rating of Location Entered',
    'Analysis Radius',
    'Analysis Area',
  ],
};

unTouchables['Administrative Areas'] = {
  investment: ['Investment Name'],
  commodity: ['Location Name', 'Location Classification'],
};
unTouchables['Oil Palm Concessions'] = {
  investment: ['Investment Name', 'Parent Company or Group', 'Certification'],
  commodity: [
    'Location Name',
    'Company Name',
    'Parent Company',
    'Location Classification',
    'Certification',
  ],
};
unTouchables['Palm Oil Mills'] = {
  investment: [],
  commodity: [
    'ID',
    'Location Name',
    'Parent Company',
    'Certification',
    'RSPO Model',
    'Alternative Mill Name',
    'Location Classification',
  ],
};
unTouchables['Protected Areas'] = {
  investment: ['Investment Name'],
  commodity: ['Location Name', 'Attribute1', 'Attribute2', 'Attribute3'],
};
unTouchables['RSPO Palm Concessions'] = {
  investment: ['Investment Name', 'Parent Company or Group', 'Certification'],
  commodity: ['Location Name', 'Parent Company', 'Certification', 'Location Classification'],
};

export default class StepTwoGFW extends Component {
  constructor(props) {
    super(props);

    let filteredFeatures = [];
    if (this.props.features.length > 0 && this.props.view === 'gfw') {
      const columnsToAdd = [];
      const template_name =
        this.props.activeTemplate === 'investment'
          ? 'Investment'
          : deduceActiveName(this.props.activeTemplate);
      filteredFeatures = this.props.features;
      const feature = filteredFeatures[0];
      const list_name = this.props.selectedLists[0].list_name;

      this.props.editFields.forEach((data) => {
        // if (data.template_datum_field_name === 'gadmid') { return; }
        if (
          data.template_name === template_name &&
          feature[data.template_datum_field_name] === undefined
        ) {
          columnsToAdd.push(data.template_datum_field_name);
        }
      });
      for (let i = 0; i < filteredFeatures.length; i++) {
        filteredFeatures[i].checked = false;
        filteredFeatures[i].valid = true;
        filteredFeatures[i].invalidFields = [];
        const otherCommodity = {
          sugarCane: 'Sugar Cane',
          pulp: 'Pulp and Paper',
          rubber: 'Rubber',
          coffee: 'Coffee',
        };

        columnsToAdd.forEach((column) => {
          filteredFeatures[i][column] = '';
        });

        // Set Commodity here
        if (this.props.activeTemplate === 'investment') {
          if (list_name === 'Protected Areas') {
            delete this.props.features[i]['Location Classification'];
          }
          if (list_name !== 'Administrative Areas') {
            filteredFeatures[i]['Investment Name'] = this.props.features[i]['Location Name'];
          }
          filteredFeatures[i].Commodity = classificationObj[this.props.commodityType]
            ? classificationObj[this.props.commodityType].commodity
            : otherCommodity[this.props.commodityType]
            ? otherCommodity[this.props.commodityType]
            : this.props.otherCommodityType
            ? this.props.otherCommodityType
            : this.props.commodityType
            ? this.props.commodityType
            : classificationObj[this.props.activeTemplate]
            ? classificationObj[this.props.activeTemplate].commodity
            : 'Other';
        } else {
          filteredFeatures[i].Commodity = classificationObj[this.props.activeTemplate]
            ? classificationObj[this.props.activeTemplate].commodity
            : otherCommodity[this.props.commodityType]
            ? otherCommodity[this.props.commodityType]
            : this.props.otherCommodityType
            ? this.props.otherCommodityType
            : this.props.commodityType
            ? this.props.commodityType
            : this.props.features[i].Commodity
            ? this.props.features[i].Commodity
            : 'Other';
        }

        if (this.props.addType === 'commodity') {
          filteredFeatures[i]['Location Classification'] = filteredFeatures[i][
            'Location Classification'
          ]
            ? filteredFeatures[i]['Location Classification']
            : classificationObj[this.props.activeTemplate]
            ? classificationObj[this.props.activeTemplate].value
            : 'Property';
          if (list_name === 'RSPO Palm Concessions') {
            filteredFeatures[i].Certification = 'yes';
          } else if (list_name === 'Palm Oil Mills') {
            filteredFeatures[i].ID = filteredFeatures[i]['Mill ID']
              ? filteredFeatures[i]['Mill ID'].toString()
              : '';
            delete filteredFeatures[i]['Mill ID'];
            filteredFeatures[i]['Company ID'] = 'n/a';
            filteredFeatures[i]['Alternative Mill Name'] = filteredFeatures[i]['Alternative Name']
              ? filteredFeatures[i]['Alternative Name'].toString()
              : '';
            delete filteredFeatures[i]['Alternative Name'];
          } else if (list_name === 'Administrative Areas') {
            filteredFeatures[i]['Location Classification'] = 'Administrative Area';
          } else if (list_name === 'Protected Areas') {
            filteredFeatures[i]['IUCN Category'] = filteredFeatures[i]['IUCN CAT']
              ? filteredFeatures[i]['IUCN CAT'].toString()
              : '';
            delete filteredFeatures[i]['IUCN CAT'];
          }

          if (list_name === 'Oil Palm Concessions') {
            switch (filteredFeatures[i].Certification.toLowerCase()) {
              case 'none':
                filteredFeatures[i].Certification = 'No';
                break;
              case '':
                filteredFeatures[i].Certification = '';
                break;
              default:
                filteredFeatures[i].Certification = 'Yes';
            }
          }
        }

        const analysisFields = {
          'Analysis Radius': '',
          'Analysis Area': '',
        };
        for (const key in filteredFeatures[i]) {
          if (key === 'Analysis Radius' || key === 'Analysis Area') {
            analysisFields[key] = filteredFeatures[i][key];
          }
          if (key.toLowerCase() === 'start date') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(filteredFeatures[i][key], filteredFeatures[i]['End Date']) === false) {
                filteredFeatures[i].valid = false;
                filteredFeatures[i].invalidFields.push(key);
              }
            });
          } else if (key.toLowerCase() === 'certification') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(filteredFeatures[i][key], this.props.activeTemplate) === false) {
                filteredFeatures[i].valid = false;
                filteredFeatures[i].invalidFields.push(key);
              }
            });
          } else if (key.toLowerCase() === 'rspo model') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(filteredFeatures[i][key], this.props.activeTemplate) === false) {
                filteredFeatures[i].valid = false;
                filteredFeatures[i].invalidFields.push(key);
              }
            });
          } else if (key.toLowerCase() === 'company id') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(filteredFeatures[i][key], this.props.activeTemplate) === false) {
                filteredFeatures[i].valid = false;
                filteredFeatures[i].invalidFields.push(key);
              }
            });
          } else if (key.toLowerCase() === 'id' && this.props.activeTemplate === 'palmMill') {
            if (filteredFeatures[i].invalidWriId) {
              filteredFeatures[i].valid = false;
            }
          } else if (
            key !== 'valid' &&
            key !== 'checked' &&
            key !== 'invalidFields' &&
            key.toLowerCase() !== 'company id' &&
            fieldValidations[key]
          ) {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(filteredFeatures[i][key]) === false) {
                filteredFeatures[i].valid = false;
                filteredFeatures[i].invalidFields.push(key);
              }
            });
          }
        }
        if (list_name === 'Palm Oil Mills') {
          if (analysisFields['Analysis Radius'] === '' && analysisFields['Analysis Area'] === '') {
            filteredFeatures[i].valid = false;
            filteredFeatures[i].invalidFields.push('Analysis Radius');
            filteredFeatures[i].invalidFields.push('Analysis Area');
          }
        }
      }
      this.props.setFeatureResults(filteredFeatures, []);
    }

    this.state = {
      showValidated: 'all',
      selectAll: false,
      disableNext: true,
      features: filteredFeatures,
      isSaving: false,
    };
  }

  toggleValidated = (evt) => {
    this.setState({ showValidated: evt.target.value });
  };

  editTableCell = (value, feature, singleKey) => {
    const { features, activeTemplate } = this.props;

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
          }
        }

        newFeaturesState[index].valid = valid;

        this.setState({
          features: newFeaturesState,
        });
      }
    });
  };

  createRow = (feature, i) => {
    let headerKey;
    locationsPage.tableKeyArray.forEach((object) => {
      let active = this.props.activeTemplate;

      if (this.props.addType === 'commodity' && active === 'investment') {
        if (this.props.commodityType === 'palmOil') {
          active = 'palmGeneric';
        } else if (this.props.commodityType === 'soy') {
          active = 'soyGeneric';
        } else if (this.props.commodityType === 'cattle') {
          active = 'cattleGeneric';
        } else if (this.props.commodityType === 'cocoa') {
          active = 'cocoaGeneric';
        }
      }
      if (object.activeTemplate === active) {
        headerKey = object.templateDataValue;
      }
    });
    const shortenedTemplateArray = [];

    this.props.editFields.forEach((data) => {
      if (data.template_name === headerKey) {
        if (data.template_datum_field_name === 'Attribute1') {
          data.template_datum_field_name_updated = this.props.customAttributeHeaders[0].custom;
          shortenedTemplateArray.push(data);
        } else if (data.template_datum_field_name === 'Attribute2') {
          data.template_datum_field_name_updated = this.props.customAttributeHeaders[1].custom;
          shortenedTemplateArray.push(data);
        } else if (data.template_datum_field_name === 'Attribute3') {
          data.template_datum_field_name_updated = this.props.customAttributeHeaders[2].custom;
          shortenedTemplateArray.push(data);
        } else {
          shortenedTemplateArray.push(data);
        }
      }
    });

    let disabled = false;
    if (!feature.id) {
      disabled = true;
    }
    let validRow = true;
    let className = 'locations-table-tr';

    const { selectedLists, addType } = this.props;

    const alwaysUntochable = unTouchables.shared;
    const currentlyUntouchable =
      selectedLists && selectedLists.length > 0 && GFWLists.indexOf(selectedLists[0].list_name) > -1
        ? unTouchables[selectedLists[0].list_name][addType]
        : [];

    const listUntouchedFields = [...alwaysUntochable, ...currentlyUntouchable];

    const createTd = (column, j) => {
      let valid = true;
      const key = column.template_datum_field_name;
      // feature[key] = feature[key] ? feature[key] : null;
      let returnedEl = (
        <td
          disabled={disabled}
          id={j}
          key={j}
          className={`locations-table-td ${feature.valid ? 'valid-td' : 'invalid-td'}`}
        ></td>
      );

      if (key === 'Attribute1') {
        returnedEl = (
          <td
            disabled={disabled}
            id={key}
            key={j}
            className={`locations-table-td ${valid ? 'valid-td' : 'invalid-td'}`}
          >
            {listUntouchedFields.indexOf(key) > -1 ? (
              <span className={`step-three-cell-span ${valid ? 'valid-td' : 'invalid-td'}`}>
                {feature[this.props.customAttributeHeaders[0].custom]}
              </span>
            ) : (
              <input
                onChange={(evt) => this.editTableCell(evt, feature, key, i)}
                placeholder={feature[this.props.customAttributeHeaders[0].custom]}
              />
            )}
          </td>
        );
      } else if (key === 'Attribute2') {
        returnedEl = (
          <td
            disabled={disabled}
            id={key}
            key={j}
            className={`locations-table-td ${valid ? 'valid-td' : 'invalid-td'}`}
          >
            {listUntouchedFields.indexOf(key) > -1 ? (
              <span className={`step-three-cell-span ${valid ? 'valid-td' : 'invalid-td'}`}>
                {feature[this.props.customAttributeHeaders[1].custom]}
              </span>
            ) : (
              <input
                onChange={(evt) => this.editTableCell(evt, feature, key, i)}
                placeholder={feature[this.props.customAttributeHeaders[1].custom]}
              />
            )}
          </td>
        );
      } else if (key === 'Attribute3') {
        returnedEl = (
          <td
            disabled={disabled}
            id={key}
            key={j}
            className={`locations-table-td ${valid ? 'valid-td' : 'invalid-td'}`}
          >
            {listUntouchedFields.indexOf(key) > -1 ? (
              <span className={`step-three-cell-span ${valid ? 'valid-td' : 'invalid-td'}`}>
                {feature[this.props.customAttributeHeaders[2].custom]}
              </span>
            ) : (
              <input
                onChange={(evt) => this.editTableCell(evt, feature, key, i)}
                placeholder={feature[this.props.customAttributeHeaders[2].custom]}
              />
            )}
          </td>
        );
      } else if (listUntouchedFields.indexOf(key) > -1) {
        returnedEl = (
          <td
            disabled={disabled}
            id={key}
            key={j}
            className={`locations-table-td ${valid === false ? 'invalid-td' : ''}`}
          >
            <span className={`step-three-cell-span ${valid ? 'valid-td' : 'invalid-td'}`}>
              {feature[key]}
            </span>
          </td>
        );
      } else {
        if (key) {
          if (!feature.valid) {
            validRow = false;
          }
          if (fieldValidations[key] && key.toLowerCase() === 'start date') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key], feature['End Date']) === false) {
                valid = false;
              }
            });
          } else if (fieldValidations[key] && key.toLowerCase() === 'certification') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key], this.props.activeTemplate) === false) {
                valid = false;
              }
            });
          } else if (fieldValidations[key] && key.toLowerCase() === 'rspo model') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key], this.props.activeTemplate) === false) {
                valid = false;
              }
            });
          } else if (fieldValidations[key] && key.toLowerCase() === 'company id') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key], this.props.activeTemplate) === false) {
                valid = false;
              }
            });
          } else if (key.toLowerCase() === 'id' && this.props.activeTemplate === 'palmMill') {
            if (feature.invalidWriId) {
              valid = false;
            }
          } else if (fieldValidations[key] && key.toLowerCase() !== 'company id') {
            fieldValidations[key].validations.forEach((validation) => {
              if (validation(feature[key], this.props.activeTemplate) === false) {
                valid = false;
              }
            });
          }
          if (
            (key === 'Analysis Radius' &&
              feature.invalidFields &&
              feature.invalidFields.indexOf('Analysis Radius') > -1) ||
            (key === 'Analysis Area' &&
              feature.invalidFields &&
              feature.invalidFields.indexOf('Analysis Area') > -1)
          ) {
            valid = false;
          }

          let hoverTitle = '';
          if (!valid) {
            if (key.toLowerCase() === 'certification') {
              hoverTitle = fieldValidations[key]
                ? fieldValidations[key].certObj[this.props.activeTemplate]
                : '';
            } else {
              hoverTitle = fieldValidations[key] ? fieldValidations[key].text : '';
            }
          }
          returnedEl = (
            <td
              title={hoverTitle}
              disabled={disabled}
              id={key}
              key={j}
              className={`locations-table-td ${valid ? 'valid-td' : 'invalid-td'}`}
            >
              <input
                onChange={(evt) => this.editTableCell(evt, feature, key, i)}
                placeholder={feature[key]}
              />
            </td>
          );
        }
      }
      return returnedEl;
    };

    const checked =
      this.props.featureResults.length > 0 ? this.props.featureResults[i].checked : false;
    const tdArray = [
      <td key={`${i} + '-validator'`}>
        <div className="column-checkbox-location">
          <input
            type="checkbox"
            className="column-checkbox"
            id={`checkbox-${i}`}
            name={i}
            checked={checked}
            onChange={this.handleInputChange}
          />
          <label htmlFor={`checkbox-${i}`} className="column-checkbox column-checkbox-single" />
        </div>
      </td>,
    ];

    shortenedTemplateArray.forEach((column, j) => {
      if (
        this.props.addType === 'commodity' &&
        column.template_datum_field_name !== 'Wind Barrier' &&
        column.template_datum_field_name !== 'Riparian Buffers' &&
        column.template_datum_field_name !== 'Buffer Zones' &&
        column.template_datum_field_name !== 'gadmid'
      ) {
        if (
          this.props.activeTemplate === 'palmMill' &&
          column.template_datum_field_name !== 'Latitude' &&
          column.template_datum_field_name !== 'Longitude'
        ) {
          if (column.template_datum_field_name === 'Attribute1') {
            column.template_datum_field_name = 'Alternative Mill Name';
          }
          tdArray.push(createTd(column, j));
        } else if (this.props.activeTemplate !== 'palmMill') {
          tdArray.push(createTd(column, j));
        }
      } else if (
        this.props.addType === 'investment' &&
        column.template_datum_field_name !== 'gadmid'
      ) {
        tdArray.push(createTd(column, j));
      }
    });

    if (this.state.showValidated === 'valid' && validRow === false) {
      className += ' hidden';
    } else if (this.state.showValidated === 'invalid' && validRow === true) {
      className += ' hidden';
    }

    if (validRow) {
      className += ' valid-row';
    } else {
      className += ' invalid-row';
    }

    return (
      <tr className={className} key={i}>
        {tdArray}
      </tr>
    );
  };

  createHeaders = () => {
    const headerArray = [
      <th key={'select all'}>
        <div className="edit-list-select-all-container table-header-cell">
          <input
            id="editListSelectAll"
            type="checkbox"
            value={'select all'}
            checked={this.state.selectAll}
            onChange={this.handleSelectAllChange}
            className="column-checkbox"
          />
          <label
            htmlFor="editListSelectAll"
            className="column-checkbox column-checkbox-single edit-list-select-all-label"
          >
            <span className="edit-list-select-all-span">All</span>
          </label>
        </div>
      </th>,
    ];
    let headerKey;

    locationsPage.tableKeyArray.forEach((object) => {
      let active = this.props.activeTemplate;

      if (this.props.addType === 'commodity' && active === 'investment') {
        if (this.props.commodityType === 'palmOil') {
          active = 'palmGeneric';
        } else if (this.props.commodityType === 'soy') {
          active = 'soyGeneric';
        } else if (this.props.commodityType === 'cattle') {
          active = 'cattleGeneric';
        } else if (this.props.commodityType === 'cocoa') {
          active = 'cocoaGeneric';
        }
      }
      if (object.activeTemplate === active) {
        headerKey = object.templateDataValue;
      }
    });

    const listName = this.props.selectedLists.length && this.props.selectedLists[0].list_name;

    this.props.editFields.forEach((data, i) => {
      if (data.template_name === headerKey) {
        if (listName === 'Administrative Areas') {
          if (
            data.template_datum_field_name === 'Analysis Area' ||
            data.template_datum_field_name === 'Analysis Radius'
          ) {
            return;
          }
        }
        if (data.template_datum_field_name === 'gadmid') {
          return;
        }
        if (data.template_datum_field_name === 'Attribute1') {
          data.template_datum_field_name_updated = this.props.customAttributeHeaders[0].custom;
          headerArray.push(
            <th key={i}>
              <div className="table-header-cell">{data.template_datum_field_name_updated}</div>
            </th>
          );
        } else if (data.template_datum_field_name === 'Attribute2') {
          data.template_datum_field_name_updated = this.props.customAttributeHeaders[1].custom;
          headerArray.push(
            <th key={i}>
              <div className="table-header-cell">{data.template_datum_field_name_updated}</div>
            </th>
          );
        } else if (data.template_datum_field_name === 'Attribute3') {
          data.template_datum_field_name_updated = this.props.customAttributeHeaders[2].custom;
          headerArray.push(
            <th key={i}>
              <div className="table-header-cell">{data.template_datum_field_name_updated}</div>
            </th>
          );
        } else if (data.template_datum_field_name === 'Accuracy Rating of Location Entered') {
          headerArray.push(
            <th key={i}>
              <div className="table-header-cell">Accuracy Rating</div>
            </th>
          );
        } else {
          if (
            this.props.addType === 'commodity' &&
            data.template_datum_field_name !== 'Wind Barrier' &&
            data.template_datum_field_name !== 'Riparian Buffers' &&
            data.template_datum_field_name !== 'Buffer Zones'
          ) {
            if (
              (this.props.activeTemplate === 'palmMill' &&
                data.template_datum_field_name !== 'Latitude' &&
                data.template_datum_field_name !== 'Longitude') ||
              this.props.activeTemplate !== 'palmMill'
            ) {
              headerArray.push(
                <th key={i}>
                  <div className="table-header-cell">{data.template_datum_field_name}</div>
                </th>
              );
            }
          } else if (this.props.addType === 'investment') {
            headerArray.push(
              <th key={i}>
                <div className="table-header-cell">{data.template_datum_field_name}</div>
              </th>
            );
          }
        }
      }
    });
    return headerArray;
  };

  handleInputChange = (evt) => {
    const featureResults = this.props.featureResults.length
      ? this.props.featureResults.slice()
      : this.props.features.slice();
    featureResults[evt.target.name].checked = !featureResults[evt.target.name].checked;

    const uploadingData = [];

    featureResults.forEach((feature) => {
      if (feature.checked) {
        uploadingData.push(feature);
      }
    });

    if (uploadingData.length === featureResults.length) {
      this.setState({
        selectAll: true,
      });
    } else {
      this.setState({
        selectAll: false,
      });
    }

    this.props.setFeatureResults(featureResults, uploadingData);
  };

  handleSelectAllChange = () => {
    const { selectAll, showValidated } = this.state;
    const { features, setFeatureResults } = this.props;

    const selectAllLocal = !selectAll;
    const featuresLocal = features.slice();
    if (selectAllLocal) {
      for (let i = 0; i < featuresLocal.length; i++) {
        if (showValidated === 'valid' && featuresLocal[i].valid) {
          featuresLocal[i].checked = true;
        } else if (showValidated === 'invalid' && !featuresLocal[i].valid) {
          featuresLocal[i].checked = true;
        } else if (showValidated === 'all') {
          featuresLocal[i].checked = true;
        }
      }
      const uploadingData = [];

      featuresLocal.forEach((feature) => {
        if (feature.checked) {
          uploadingData.push(feature);
        }
      });
      setFeatureResults(featuresLocal, uploadingData);
      this.setState({
        selectAll: selectAllLocal,
      });
    } else {
      for (let i = 0; i < featuresLocal.length; i++) {
        featuresLocal[i].checked = false;
      }
      setFeatureResults(featuresLocal, []);
      this.setState({
        // featureResults: featureResults,
        selectAll: selectAllLocal,
      });
    }
  };

  handlingCheckboxChange = (locationID) => {
    const features = this.props.features.slice();

    features.forEach((feature) => {
      if (feature['location_id'] === locationID) {
        feature.checked = !feature.checked;
      }
    });

    const uploadingData = [];

    features.forEach((feature) => {
      if (feature.checked) {
        uploadingData.push(feature);
      }
    });

    if (uploadingData.length === features.length) {
      this.setState({
        selectAll: true,
      });
    } else {
      this.setState({
        selectAll: false,
      });
    }

    this.props.setFeatureResults(features, uploadingData);
  };

  downloadCsv = () => {
    const { selectedLists } = this.props;
    const isListExcluded = isDownloadDisabledForThisList(selectedLists[0]);
    const csvData = [[]];
    const template_name =
      this.props.activeTemplate === 'investment'
        ? 'Investment'
        : deduceActiveName(this.props.activeTemplate);

    this.props.editFields.forEach((data) => {
      if (data.template_name === template_name) {
        const fieldName = data.template_datum_field_name;
        if (fieldName !== 'gadmid' && !(isListExcluded && EXCLUDED_COLUMNS.includes(fieldName))) {
          if (this.props.addType === 'commodity') {
            if (
              fieldName !== 'Wind Barrier' &&
              fieldName !== 'Riparian Buffers' &&
              fieldName !== 'Buffer Zones'
            ) {
              csvData[0].push(fieldName);
            }
          } else {
            csvData[0].push(fieldName);
          }
        }
      }
    });

    this.props.features.forEach((feat) => {
      const dataRow = [];
      this.props.editFields.forEach((data) => {
        if (data.template_name === template_name) {
          const fieldName = data.template_datum_field_name;
          if (fieldName !== 'gadmid' && !(isListExcluded && EXCLUDED_COLUMNS.includes(fieldName))) {
            if (this.props.addType === 'commodity') {
              if (
                fieldName !== 'Wind Barrier' &&
                fieldName !== 'Riparian Buffers' &&
                fieldName !== 'Buffer Zones'
              ) {
                dataRow.push(
                  feat[fieldName] && feat[fieldName].includes && feat[fieldName].includes(',')
                    ? `"${feat[fieldName]}"`
                    : feat[fieldName].replace
                    ? feat[fieldName].replace(/^\s+|\s+$/g, '')
                    : fieldName === 'Accuracy Rating of Location Entered'
                    ? this.parseAccuracy(feat[fieldName])
                    : feat[fieldName]
                );
              }
            } else {
              dataRow.push(
                feat[fieldName] && feat[fieldName].includes && feat[fieldName].includes(',')
                  ? `"${feat[fieldName]}"`
                  : feat[fieldName].replace
                  ? feat[fieldName].replace(/^\s+|\s+$/g, '')
                  : fieldName === 'Accuracy Rating of Location Entered'
                  ? this.parseAccuracy(feat[fieldName])
                  : feat[fieldName]
              );
            }
          }
        }
      });
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
    const headerFields = this.createHeaders();
    const { isSaving } = this.state;
    const isListExcluded = isDownloadDisabledForThisList(selectedLists[0]);

    return (
      <div className={`locations-upload-step ${this.props.step === 2 ? '' : 'hidden'}`}>
        <ModalLoader open={isSaving} />
        <div className="locations-subpage-header subtitle page-heading">
          Add Selected Global Forest Watch List Location(s)
        </div>
        <div className="download-step-container">
          <p className="locations-subpage-header__steps step-three-count">Step 2 of 3</p>
          <span onClick={this.downloadCsv} className="locations-diagnostics-icon-holder">
            <svg className="svg-icon">
              <use xlinkHref="#icon-download" />
            </svg>
          </span>
        </div>

        <input
          type="radio"
          id="gfwValidateRadio"
          name="gfw-validate"
          value="valid"
          checked={this.state.showValidated === 'valid'}
          onChange={this.toggleValidated}
        />
        <label htmlFor="gfwValidateRadio" className="locations-select-type-label">
          {locationsPage.upload.showValidated}
        </label>
        <input
          type="radio"
          id="gfwNoValidateRadio"
          value="invalid"
          name="gfw-no-validate"
          checked={this.state.showValidated === 'invalid'}
          onChange={this.toggleValidated}
        />
        <label htmlFor="gfwNoValidateRadio" className="locations-select-type-label">
          {locationsPage.upload.showNotValidated}
        </label>
        <input
          type="radio"
          id="gfwAnyRadio"
          value="all"
          name="gfw-any-validate"
          checked={this.state.showValidated === 'all'}
          onChange={this.toggleValidated}
        />
        <label htmlFor="gfwAnyRadio" className="locations-select-type-label">
          {locationsPage.upload.showAllValidated}
        </label>

        <MultiGridTable
          addType={this.props.addType}
          activeTemplate={this.props.activeTemplate}
          commodityType={this.props.commodityType}
          customAttributeHeaders={this.props.customAttributeHeaders}
          features={_getFeatures(this.state.features, this.state.showValidated)}
          selectAll={this.state.selectAll}
          templateData={this.props.templateData}
          isListExcluded={isListExcluded}
          // methods
          _editTableCell={this.editTableCell}
          _handleSelectAllChange={this.handleSelectAllChange}
          _handlingCheckboxChange={this.handlingCheckboxChange}
        />
      </div>
    );
  }
}
