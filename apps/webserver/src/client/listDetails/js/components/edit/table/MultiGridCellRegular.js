import React, { PureComponent } from 'react';

import { locationsPage } from '../../../../../common/js/config';
import { fieldValidations } from '../../../../../locations/js/utils/validations';
import { PopupTooltipError } from './popup/PopupTooltipError';
import IconEdit from '../../../../../common/js/components/icon/IconEdit';
import CustomTooltip from '../../../../../common/js/components/CustomTooltip/CustomTooltip';
import FailedTooltip from '../../../../../common/js/components/CustomTooltip/FailedTooltip';

export class MultiGridCellRegular extends PureComponent {
  constructor(props, context) {
    super(props, context);
    const { addType, activeTemplate, commodityType, customAttributeHeaders, templateData } =
      this.props;

    let headerKey;
    locationsPage.tableKeyArray.forEach((object) => {
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
      if (object.activeTemplate === active) {
        headerKey = object.templateDataValue;
      }
    });

    const shortenedTemplateArray = [];
    templateData.forEach((data) => {
      if (data.template_name === headerKey) {
        if (data.template_datum_field_name === 'gadmid') {
          return;
        }
        if (data.template_datum_field_name === 'Attribute1') {
          if (customAttributeHeaders[0].custom !== 'Attribute1') {
            data.template_datum_field_name_updated = customAttributeHeaders[0].custom;
            shortenedTemplateArray.push(data);
          }
        } else if (data.template_datum_field_name === 'Attribute2') {
          if (customAttributeHeaders[1].custom !== 'Attribute2') {
            data.template_datum_field_name_updated = customAttributeHeaders[1].custom;
            shortenedTemplateArray.push(data);
          }
        } else if (data.template_datum_field_name === 'Attribute3') {
          if (customAttributeHeaders[2].custom !== 'Attribute3') {
            data.template_datum_field_name_updated = customAttributeHeaders[2].custom;
            shortenedTemplateArray.push(data);
          }
        } else {
          shortenedTemplateArray.push(data);
        }
      }
    });

    this.state = {
      showErrorMessage: false,
      shortenedTemplateArray: shortenedTemplateArray,
    };
  }

  _createCell = (column, j) => {
    const {
      activeTemplate,
      columnName,
      customAttributeHeaders,
      feature,
      _editTableCell,
      _filterFeatures,
      _handleTrackCellUpdates,
    } = this.props;
    const { showErrorMessage } = this.state;
    const columnNameUnderscored = columnName.split(' ').join('_');
    let valid = true;
    const key = column.template_datum_field_name;

    let statusIcon = '';
    if (feature.location_status_id === 4) {
      statusIcon = (
        <span className="DiagnosticStatusDraft__label_table">
          <CustomTooltip
            placement={'top'}
            label={''}
            tooltipMessage={
              'This location has not been analyzed. To view location details and diagnostics for this list, please click the submit button at the top of the screen.'
            }
          />
        </span>
      );
    } else if (feature.location_status_id === 3) {
      statusIcon = (
        <span className="my-lists-summary__icon-container">
          <FailedTooltip
            placement={'top'}
            label={''}
            tooltipMessage={
              'This location has failed analysis. To receive results, resubmit this list for analysis.'
            }
          />
        </span>
      );
    } else {
      statusIcon = '';
    }

    let returnedEl = (
      <div
        id={j}
        key={j}
        className={`locations-table-td ${feature.valid ? 'valid-td' : 'invalid-td'}`}
      />
    );
    if (key === 'Attribute1' || key === 'Attribute2' || key === 'Attribute3') {
      let customAttributeName;
      if (key === 'Attribute1') {
        customAttributeName = customAttributeHeaders[0].custom;
      } else if (key === 'Attribute2') {
        customAttributeName = customAttributeHeaders[1].custom;
      } else {
        customAttributeName = customAttributeHeaders[2].custom;
      }

      returnedEl = (
        <div
          title={''}
          key={j}
          className={`locations-grid-cell ${valid ? 'valid-td' : 'invalid-td'}`}
        >
          <input
            onInput={(evt) => {
              _handleTrackCellUpdates(feature['location_id']);
              _editTableCell(evt.target.value, feature, customAttributeName);
            }}
            onBlur={() => {
              _filterFeatures();
            }}
            title={feature[customAttributeName]}
            defaultValue={feature[customAttributeName]}
          />
        </div>
      );
    } else if (
      key === 'Location Name' ||
      key === 'Latitude' ||
      key === 'Longitude' ||
      key === 'Investment Name' ||
      key === 'Analysis Radius' ||
      key === 'Analysis Area' ||
      key === 'Commodity' ||
      key === 'Location Classification' ||
      key === 'Country' ||
      key === 'State' ||
      key === 'Sub State'
    ) {
      returnedEl = (
        <div
          key={j}
          className={`locations-grid-cell locations-grid-cell--non-editable ${
            valid === false &&
            (key === 'Investment Name' ||
              key === 'Location Name' ||
              key === 'Latitude' ||
              key === 'Longitude' ||
              key === 'Country' ||
              key === 'State' ||
              key === 'Sub State')
              ? 'invalid-td'
              : ''
          } ${
            (valid && !feature.invalidFields) || !feature.invalidFields.includes(key)
              ? 'valid-td'
              : 'invalid-td'
          }`}
        >
          <span
            title={
              feature.invalidFields && feature.invalidFields.includes(key)
                ? `${locationsPage.add.errors.cannotBeEditedInBrowser} ${fieldValidations[key].text}`
                : ''
            }
            className={`step-three-cell-span ${columnNameUnderscored} `}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              justifyContent: 'space-between',
              fontStyle: 'italic',
            }}
          >
            <span
              title={
                ['Latitude', 'Longitude'].includes(columnNameUnderscored) && feature[key].toFixed
                  ? feature[key].toFixed(6)
                  : feature[key]
              }
              style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              {['Latitude', 'Longitude'].includes(columnNameUnderscored) && feature[key].toFixed
                ? feature[key].toFixed(6)
                : feature[key]}
            </span>
            {key === 'Location Name' && statusIcon}
          </span>
        </div>
      );
    } else if (key) {
      if (fieldValidations[key] && key.toLowerCase() === 'start date') {
        fieldValidations[key].validations.forEach((validation) => {
          if (validation(feature[key], feature['End Date']) === false) {
            valid = false;
          }
        });
      } else if (fieldValidations[key] && key.toLowerCase() === 'certification') {
        fieldValidations[key].validations.forEach((validation) => {
          if (validation(feature[key], activeTemplate) === false) {
            valid = false;
          }
        });
      } else if (fieldValidations[key] && key.toLowerCase() === 'rspo model') {
        fieldValidations[key].validations.forEach((validation) => {
          if (validation(feature[key], activeTemplate) === false) {
            valid = false;
          }
        });
      } else if (fieldValidations[key] && key.toLowerCase() === 'company id') {
        fieldValidations[key].validations.forEach((validation) => {
          if (validation(feature[key], activeTemplate) === false) {
            valid = false;
          }
        });
      } else if (key.toLowerCase() === 'id' && activeTemplate === 'palmMill') {
        if (feature.invalidWriId) {
          valid = false;
        }
      } else if (fieldValidations[key] && key.toLowerCase() !== 'company id') {
        fieldValidations[key].validations.forEach((validation) => {
          if (validation(feature[key], activeTemplate) === false) {
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
          hoverTitle = fieldValidations[key] ? fieldValidations[key].certObj[activeTemplate] : '';
        } else {
          hoverTitle = fieldValidations[key] ? fieldValidations[key].text : '';
        }
      }

      returnedEl = (
        <div
          key={j}
          className={`locations-grid-cell locations-grid-cell--editable ${
            valid ? 'valid-td' : 'invalid-td'
          }`}
        >
          <React.Fragment>
            <input
              onChange={(evt) => {
                _handleTrackCellUpdates(feature['location_id']);
                _editTableCell(evt.target.value, feature, key, evt.target);
              }}
              onBlur={() => {
                _filterFeatures();
              }}
              value={feature[key] || ''}
              title={feature[key] || ''}
              onMouseEnter={valid ? null : () => this.setState({ showErrorMessage: true })}
              onMouseLeave={valid ? null : () => this.setState({ showErrorMessage: false })}
            />
            {!valid && (
              <PopupTooltipError
                key={j}
                errorMessage={hoverTitle}
                showErrorMessage={showErrorMessage}
              />
            )}
          </React.Fragment>
          <div className="locations-grid-cell__icon-container">
            <IconEdit className="locations-grid-cell__icon" />
          </div>
        </div>
      );
    }
    return returnedEl;
  };

  render() {
    const { addType, columnName } = this.props;
    const { shortenedTemplateArray } = this.state;

    return shortenedTemplateArray.map((column, j) => {
      if (
        addType === 'commodity' &&
        column.template_datum_field_name !== 'Wind Barrier' &&
        column.template_datum_field_name !== 'Riparian Buffers' &&
        column.template_datum_field_name !== 'Buffer Zones' &&
        (column.template_datum_field_name === columnName ||
          column.template_datum_field_name_updated === columnName)
      ) {
        return this._createCell(column, j);
      } else if (addType === 'investment' && column.template_datum_field_name === columnName) {
        return this._createCell(column, j);
      }
    });
  }
}
