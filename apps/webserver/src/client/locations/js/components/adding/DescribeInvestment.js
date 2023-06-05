import React, { Component } from 'react';
import Select from 'react-select';
import { locationsPage } from '../../../../common/js/config';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { customAttributeRegex } from '../../utils/validations';

export default class DescribeInvestment extends Component {
  constructor(props) {
    super(props);

    this.currencyDropdownOptions = props.templateDropdowns
      .filter((i) => i.template_metadata_id === 14)
      .map((i) => i.dropdown_value);
  }

  filterTemplates = (template) => {
    if (this.props.locationType === 'multiple') {
      // Only show extra attribute fields in multi-upload wizard
      return customAttributeRegex.test(template.template_datum_field_name);
    } else {
      const notCommodityField = template.template_datum_field_name.toLowerCase() !== 'commodity';
      const notIgnored =
        locationsPage.upload.ignoredInvestmentFields.indexOf(template.template_datum_field_name) ===
        -1;
      return notIgnored && notCommodityField;
    }
  };

  createInvestmentTemplate = (templates) => {
    const filteredTemplates = templates.filter(this.filterTemplates);
    return filteredTemplates.length ? filteredTemplates.map(this.createRow) : null;
  };

  createMultiOptions = (option) => {
    return { label: option.label, value: option.id };
  };

  createRow = (template, j) => {
    let defaultVal;
    if (template.hasOwnProperty('template_datum_field_value')) {
      defaultVal = template.template_datum_field_value;
    }

    const multiOptions =
      template.ui_type === 'multi-dropdown' && this.props.contentEditable
        ? this.filterDropdowns(template)
            .filter((v) => v.id !== 'select')
            .map(this.createMultiOptions)
        : [];

    return (
      <tr key={template.template_datum_field_name + '-template-row'}>
        <td
          id={template.template_datum_field_description + '-value'}
          key={template.template_datum_field_description + '-value-' + j}
          className="user-table-td value"
        >
          <label className="block-label">
            {template.template_datum_field_name}
            {template.template_datum_mandatory ? '*' : ''}
            {template.ui_type === 'single-dropdown' && this.props.contentEditable ? (
              <div className="dropdown-group">
                <GfwSelect
                  value={defaultVal}
                  options={this.filterDropdowns(template)}
                  placeholder="Select..."
                  onChange={(evt) => this.props.editTemplate(evt, template)}
                />
              </div>
            ) : template.ui_type === 'multi-dropdown' && this.props.contentEditable ? (
              <Select
                className="edge-multi-select addLocation"
                options={multiOptions}
                isMulti={true}
                isSearchable={true}
                maxMenuHeight={150}
                defaultValue={defaultVal}
                onChange={(evt) => this.props.editTemplate(evt, template, true)}
              />
            ) : (
              <input
                key={template.template_datum_field_name + '-key'}
                maxLength="150"
                title={template.template_datum_field_description}
                placeholder={template.template_datum_field_description}
                value={defaultVal}
                onChange={(evt) => this.props.editTemplate(evt, template)}
                className={`location-input-field value ${
                  !this.props.contentEditable ? 'read-only-input' : ''
                }`}
                readOnly={!this.props.contentEditable}
              ></input>
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

    options.sort((a, b) => {
      return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
    });
    return options;
  };

  render() {
    const templateBodies = this.createInvestmentTemplate(this.props.templateData);
    return (
      <section
        className={`investment-table ${this.props.addType === 'investment' ? '' : 'hidden'}`}
      >
        <div className="locations-describe-table">
          <table>
            <tbody>
              {templateBodies && templateBodies}
              <tr
                className={`investment-size-container ${
                  this.props.contentEditable ? '' : 'hidden'
                }`}
              >
                <td className="user-table-td value">
                  <label id="size-of-investment-tag" className="user-table-td tag block-label">
                    {locationsPage.add.sizeOfInvestment}
                    <div className="investment-currency-container">
                      <input
                        key={'investment-size-input'}
                        maxLength="150"
                        value={this.props.size}
                        onChange={this.props.updateInvestmentSize}
                        className="location-input-field value investment-size-input"
                      />
                      <div className="dropdown-group">
                        <GfwSelect
                          options={this.currencyDropdownOptions}
                          onChange={this.props.updateInvestmentCurrency}
                          value={this.props.currency}
                        />
                      </div>
                    </div>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {!templateBodies && (
          <div className="locations-describe__empty-container">
            <p className="locations-describe__description">
              {locationsPage.add.additionalFieldsNotSupported}
            </p>
          </div>
        )}
      </section>
    );
  }
}
