import React, { Component } from 'react';
import Select from 'react-select';

import { changeTemplate } from '../../actions/locationActions';
import store from '../../store';
import { locationsPage } from '../../../../common/js/config';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { customAttributeRegex } from '../../utils/validations';

export default class DescribeLocation extends Component {
  createLocationHeaders = (template) => {
    let className = 'locations-describe-header';
    if (this.props.activeTemplate === template.id) {
      className += ' selected-method';
    } else if (this.props.activeTemplate === 'investment' && template.id === 'other') {
      className += ' selected-method';
    } else if (
      (this.props.activeTemplate === 'investment' && template.id === 'palmGeneric') ||
      (this.props.activeTemplate === 'investment' && template.id === 'cocoaGeneric') ||
      (this.props.activeTemplate === 'investment' && template.id === 'cattleGeneric') ||
      (this.props.activeTemplate === 'investment' && template.id === 'soyGeneric')
    ) {
      if (this.props.contentEditable === false) {
        className += ' selected-method';
      }
    }

    if (template.id === 'other') {
      if (this.props.activeTemplate === 'other') {
        className += ' selected-method';
      } else if (
        (this.props.activeTemplate === 'other' && template.id === 'other') ||
        (this.props.commodityType === 'other' && this.props.activeTemplate === 'generic')
      ) {
        className += ' selected-method';
      }

      return (
        <div
          onClick={this.changeTemplate}
          id={template.id}
          key={template.label + '-template-header'}
          className={className}
        >
          {template.label}
        </div>
      );
    } else {
      return (
        <div
          onClick={this.changeTemplate}
          id={template.id}
          key={template.label + '-template-header'}
          className={className}
        >
          {template.label}
        </div>
      );
    }
  };

  filterTemplates = (template) => {
    if (this.props.locationType === 'multiple') {
      return (
        locationsPage.upload.ignoredMultipleCommodityFields.indexOf(
          template.template_datum_field_name
        ) === -1
      );
    } else {
      return (
        locationsPage.upload.ignoredCommodityFields.indexOf(template.template_datum_field_name) ===
        -1
      );
    }
  };

  createLocationTemplate = (templates) => {
    const displayedTemplates = templates.filter(this.filterTemplates);
    const activeTemplates = displayedTemplates.filter((template) => {
      let template_name;
      if (this.props.contentEditable) {
        template_name = deduceActiveName(this.props.activeTemplate);
        return (
          template.template_name === template_name &&
          !!this.props.required === !!template.template_datum_mandatory &&
          (!this.isReadOnly(template) || this.props.locationType === 'multiple')
        );
      } else {
        switch (this.props.commodityType) {
          case 'palmOil':
            if (this.props.activeTemplate === 'palmMill') {
              template_name = 'Palm Oil Mill';
            } else if (this.props.activeTemplate === 'palmFarm') {
              template_name = 'Palm Smallholder Farm';
            } else if (this.props.activeTemplate === 'palmPlantation') {
              template_name = 'Palm Oil Plantation';
            } else {
              template_name = 'Palm Oil Generic';
            }
            break;
          case 'pulp':
            template_name = 'Other';
            break;
          case 'cattle':
            if (this.props.activeTemplate === 'beef') {
              template_name = 'Beef Slaughterhouse';
            } else if (this.props.activeTemplate === 'cattle') {
              template_name = 'Cattle Ranch';
            } else {
              template_name = 'Cattle Generic';
            }
            break;
          case 'coffee':
            template_name = 'Other';
            break;
          case 'rubber':
            template_name = 'Other';
            break;
          case 'cocoa':
            if (this.props.activeTemplate === 'cocoa') {
              template_name = 'Cocoa Farm';
            } else {
              template_name = 'Cocoa Generic';
            }
            break;
          case 'soy':
            if (this.props.activeTemplate === 'soySilo') {
              template_name = 'Soy Silo';
            } else if (this.props.activeTemplate === 'soyFarm') {
              template_name = 'Soy Farm';
            } else {
              template_name = 'Soy Generic';
            }
            break;
          case 'sugarCane':
            template_name = 'Other';
            break;
          case 'multiple':
            template_name = 'Other';
            break;
          case 'other':
            template_name = 'Other';
            break;
          default:
            template_name = 'Other';
        }

        return (
          template.template_name === template_name &&
          !!this.props.required === !!template.template_datum_mandatory &&
          (!this.isReadOnly(template) || this.props.locationType === 'multiple') &&
          // Only display additional attributes on multi-upload wizard
          (this.props.locationType !== 'multiple' ||
            template.template_datum_field_name.indexOf('Attribute') === 0)
        );
      }
    });
    return activeTemplates.map(this.createRow);
  };

  isReadOnly = (template) => {
    let readOnly = false;

    if (!this.props.contentEditable) {
      readOnly = true;
    } else if (
      template.template_datum_field_name === 'Commodity' &&
      this.props.activeTemplate === 'other'
    ) {
      readOnly = false;
    } else if (template.template_datum_field_name === 'Commodity') {
      readOnly = true;
    }

    return readOnly;
  };

  findLocationClassValue = () => {
    let commodity = '';
    switch (this.props.activeTemplate) {
      case 'palmMill':
        commodity = true;
        break;
      case 'palmPlantation':
        commodity = true;
        break;
      case 'palmFarm':
        commodity = true;
        break;
      case 'palmGeneric':
        commodity = false;
        break;
      case 'cattle':
        commodity = true;
        break;
      case 'beef':
        commodity = true;
        break;
      case 'cattleGeneric':
        commodity = false;
        break;
      case 'cocoa':
        commodity = true;
        break;
      case 'cocoaGeneric':
        commodity = false;
        break;
      case 'soyFarm':
        commodity = true;
        break;
      case 'soySilo':
        commodity = true;
        break;
      case 'soyGeneric':
        commodity = false;
        break;
      case 'other':
        commodity = false;
        break;
      default:
        commodity = false;
    }
    return commodity;
  };

  createMultiOptions = (option) => {
    return { label: option.label, value: option.id };
  };

  // Preserve the custom attribute field names on the second multi-upload step
  // across step navigations.
  getCustomAttrName = (template) => {
    if (!template.template_datum_field_value) {
      const customAttr = this.props.customAttributeHeaders
        ? this.props.customAttributeHeaders.find((attr) => {
            return attr.field === template.template_datum_field_name;
          })
        : null;
      return customAttr && customAttr.custom !== customAttr.field ? customAttr.custom : '';
    } else {
      return template.template_datum_field_value;
    }
  };

  createRow = (template, j) => {
    if (template.template_datum_field_name === 'Location Classification') {
      if (this.findLocationClassValue() === true) {
        template.template_datum_field_value =
          locationsPage.locationClassValues[this.props.activeTemplate].value;
      } else if (this.props.addMethod) {
        if (!this.findLocationClassValue() && this.props.addMethod === 'bySelection') {
          template.template_datum_field_value = 'Administrative Area';
        } else if (!this.findLocationClassValue() && this.props.addMethod === 'byConcession') {
          template.template_datum_field_value = 'Supply Shed';
        } else if (!this.findLocationClassValue() && this.props.addMethod === 'byCertified') {
          template.template_datum_field_value = 'Supply Shed';
        }
      }
    }

    if (
      this.props.activeTemplate !== 'other' &&
      template.template_datum_field_name === 'Commodity' &&
      !template.template_datum_field_value
    ) {
      template.template_datum_field_value = template.template_datum_field_description;
    }

    if (
      customAttributeRegex.test(template.template_datum_field_name) &&
      !template.template_datum_field_name_updated
    ) {
      template.template_datum_field_name_updated = template.template_datum_field_name;
    }
    const permanentClassTag = 'tag';
    const permanentClassValue = 'value';

    const multiOptions =
      template.ui_type === 'multi-dropdown' && this.props.contentEditable
        ? this.filterDropdowns(template)
            .filter((v) => v.id !== 'select')
            .map(this.createMultiOptions)
        : [];

    let defaultVal;
    if (template.hasOwnProperty('template_datum_field_value')) {
      defaultVal = template.template_datum_field_value;
    }

    return (
      <tr key={template.template_datum_field_name + '-template-row' + j}>
        <td
          id={template.template_datum_field_description + '-value'}
          key={template.template_datum_field_description + '-value-' + j}
          className={`user-table-td ${permanentClassValue}`}
        >
          <label className="block-label">
            {customAttributeRegex.test(template.template_datum_field_name)
              ? `${locationsPage.add.additionalAttributeLabel} ${parseInt(
                  template.template_datum_field_name.match(customAttributeRegex)[1]
                )}`
              : `${template.template_datum_field_name}`}
            {template.ui_type === 'single-dropdown' && this.props.contentEditable ? (
              <div className="dropdown-group">
                <GfwSelect
                  value={template.template_datum_field_value}
                  options={this.filterDropdowns(template)}
                  placeholder="Select..."
                  onChange={(evt) => this.props.editTemplate(evt, template)}
                />
              </div>
            ) : template.ui_type === 'multi-dropdown' && this.props.contentEditable ? (
              <Select
                defaultValue={defaultVal}
                className="edge-multi-select addLocation"
                options={multiOptions}
                isMulti={true}
                isSearchable={true}
                onChange={(evt) => this.props.editTemplate(evt, template, true)}
                maxMenuHeight={150}
              />
            ) : customAttributeRegex.test(template.template_datum_field_name) ? (
              <input
                maxLength="150"
                placeholder={template.template_datum_field_name}
                onChange={(evt) => this.props.editTemplate(evt, template)}
                className={`user-table-td ${permanentClassTag}`}
                defaultValue={this.getCustomAttrName(template)}
              />
            ) : (
              <>
                <p className="hint-text">{template.template_datum_field_description}</p>
                <input
                  maxLength="150"
                  title={template.template_datum_field_description}
                  value={template.template_datum_field_value}
                  onChange={(evt) => this.props.editTemplate(evt, template)}
                  className={`location-input-field ${permanentClassValue} ${
                    !this.props.contentEditable ? 'read-only-input' : ''
                  }`}
                />
              </>
            )}
          </label>
        </td>
      </tr>
    );
  };

  filterDropdowns = (template) => {
    const options = [];
    this.props.templateDropdowns.forEach((dropdown, i) => {
      if (dropdown.template_metadata_id === template.id) {
        options.push({
          label: dropdown.dropdown_value,
          id: template.template_datum_field_name + '_' + dropdown.template_metadata_id + i,
          value: dropdown.dropdown_value,
        });
      }
    });
    return options;
  };

  changeTemplate = (evt) => {
    if (this.props.resetLocationClassification) {
      this.props.resetLocationClassification();
    }
    store.dispatch(changeTemplate(evt.target.id));
  };

  render() {
    const templateOptions = locationsPage.upload.templateOptions;
    const templateBodies =
      this.props.addType === 'commodity'
        ? [this.createLocationTemplate(this.props.templateData)]
        : [];

    return this.props.required ? (
      <div
        className={`locations-describe-table--required-fields locations-describe-table ${
          this.props.addType === 'commodity' ? '' : 'hidden'
        }`}
      >
        <table>
          <tbody>{templateBodies}</tbody>
        </table>
      </div>
    ) : (
      <div
        className={`locations-add-describe ${this.props.addType === 'commodity' ? '' : 'hidden'}`}
      >
        <div className="locations-subpage-describe">
          <p>{locationsPage.add.additionalAttributesDescriptionSingle}</p>
          <div className="locations-describe-table">
            <table>
              <tbody>{templateBodies}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
