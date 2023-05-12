import React, { Component } from 'react';
import { locationsPage } from '../../../../common/js/config';
import { deduceActiveId, deduceActiveName } from '../../../../common/js/utils/templateUtils';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { filterValidCustom } from '../../utils/moveLocations';
import { getListValidStatus } from '../../utils/lists.utils';

export default class AddList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: [],
    };
  }

  // TODO: resolve this version and the one in locations/js/utils/movelocations.js,
  // which does not check the classification
  filterValidTemplates = (template) => {
    let templateId = 1;
    let sameClassification = true;
    const validListStatus = getListValidStatus(template.list_status_id);
    if (this.props.addType === 'commodity') {
      templateId = deduceActiveId(this.props.activeTemplate);

      if (
        this.props.selectedLocationClassification &&
        template &&
        template.location_classification &&
        this.props.selectedLocationClassification.toLowerCase() !== template.location_classification.toLowerCase()
      ) {
        sameClassification = false;
      }

      if (template && template.template_id === 1 && !template.location_classification) {
        sameClassification = false;
      }
    }

    return template && template.template_id === templateId && validListStatus && sameClassification;
  };

  getActive = () => {
    const template_name = deduceActiveName(this.props.activeTemplate);

    const activeTemplates = this.props.commodityTemplates.filter((template) => {
      return template.template_name === template_name;
    });

    return activeTemplates;
  };

  render() {
    let validLists = this.props.userLists.filter(this.filterValidTemplates);

    if (this.props.addType === 'commodity') {
      const customFields = [];
      const activeTemplates = this.getActive();
      activeTemplates.forEach((template) => {
        if (
          template.template_datum_field_name_updated &&
          template.template_datum_field_name_updated !== 'Attribute1' &&
          template.template_datum_field_name_updated !== 'Attribute2' &&
          template.template_datum_field_name_updated !== 'Attribute3'
        ) {
          customFields.push(template.template_datum_field_name_updated);
        }
      });

      validLists = validLists.filter((template) => {
        return filterValidCustom(template, customFields);
      });
    }

    const dropdownOptionsInvestmentCommodity = buildDropdownOptions(validLists, 'list_name').dropdownOptions;
    const addToExistingList = this.props.selectedList !== 'Create New List' && validLists.length > 0;

    return (
      <div className="locations-adding">
        <div className="locations-adding__header">
          <h3 className="locations-adding__title">{locationsPage.add.addToListTitle}</h3>
          <p className="locations-adding__prompt">{locationsPage.add.addToListDesc}</p>
        </div>

        <div>
          <div className={`input-field__block-container ${!validLists.length ? 'disabled-radio' : ''}`}>
            <input
              type="radio"
              name="addToNewOrExistingList"
              id="addToExistingList"
              checked={addToExistingList}
              disabled={!validLists.length}
              onChange={(evt) => {
                if (evt.target.checked && dropdownOptionsInvestmentCommodity.length > 0) {
                  this.props.updateList(dropdownOptionsInvestmentCommodity[0].value);
                } else {
                  this.props.updateList('');
                }
              }}
            />
            <label htmlFor="addToExistingList">{locationsPage.add.addToListInstructions}</label>
            {addToExistingList && (
              <GfwSelect
                id="add-to-existing-list"
                className="locations-upload-save__optl-input"
                options={dropdownOptionsInvestmentCommodity}
                value={this.props.selectedList}
                onChange={(e) => this.props.updateList(e.value)}
                disabled={!validLists.length}
              />
            )}
          </div>
          <div className="input-field__block-container">
            <input
              type="radio"
              name="addToNewOrExistingList"
              id="addToNewList"
              checked={!addToExistingList}
              onChange={(evt) => {
                if (evt.target.checked) {
                  this.props.clearAddToListDropdown();
                }
              }}
            />
            <label htmlFor="addToNewList" className="block-label">
              {locationsPage.add.createListInstructions}
            </label>
            {!addToExistingList && (
              <div className="input-field__block-container">
                <input
                  id="new-list-name"
                  key={this.props.activeTemplate}
                  value={this.props.listPlaceholderValue}
                  onChange={this.props.updateCustomList}
                  className="locations-adding__new-list-name locations-upload-save__optl-input"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
