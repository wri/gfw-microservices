import React, { Component } from 'react';

import GfwSelect from '../../../../common/js/components/GfwSelect';
import { locationsPage } from '../../../../common/js/config';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import { filterValidTemplates, filterValidCustom } from '../../utils/moveLocations';

export default class StepFour extends Component {
  constructor(props) {
    super(props);
    const { addType, activeTemplate, commodityType, otherCommodityType, hideSelectList } = props;

    let locationClassification;
    if (addType === 'investment') {
      locationClassification = 'Recent Investments';
      if (this.checkExistingList(locationClassification)) {
        let count = 1;
        while (this.checkExistingList(locationClassification)) {
          const result = locationClassification.match(/([0-9]+)$/);
          let num = 0;
          if (result !== null) {
            num = parseInt(result[0]);
            locationClassification = `${locationClassification.substring(0, result.index)}${
              num + 1
            }`;
          } else {
            locationClassification = `${locationClassification} ${count}`;
          }
          count++;
        }
      }
    } else if (addType === 'commodity') {
      const type = activeTemplate === 'generic' ? commodityType : activeTemplate;
      let newListName;
      if (commodityType !== 'other') {
        newListName = deduceActiveName(type);
      } else {
        newListName = otherCommodityType;
      }
      locationClassification = `Recent ${newListName}`;
      if (this.checkExistingList(locationClassification)) {
        let count = 1;
        while (this.checkExistingList(locationClassification)) {
          const result = locationClassification.match(/([0-9]+)$/);
          let num = 0;
          if (result !== null) {
            num = parseInt(result[0]);
            locationClassification = `${locationClassification.substring(0, result.index)}${
              num + 1
            }`;
          } else {
            locationClassification = `${locationClassification} ${count}`;
          }
          count++;
        }
      }
    }

    this.state = {
      createNewList: false,
      // Internal-only values to repopulate interface when toggling between options.
      _newListName: locationClassification,
      _selectedExistingList: { name: '', value: '' },
    };
  }

  componentDidMount() {
    const { updateCustomList, hideSelectList } = this.props;
    if (hideSelectList) {
      updateCustomList(this.state._newListName);
    } else {
      updateCustomList('');
    }
  }

  checkExistingList(locationClassification) {
    return this.props.orgLists.some((list) => list.list_name === locationClassification);
  }

  getActive = () => {
    const template_name = deduceActiveName(this.props.activeTemplate);
    const commodityTemplates = this.props.templateData.filter(
      (template) => template.location_type_name === 'Commodity'
    );

    const activeTemplates = commodityTemplates.filter((template) => {
      return template.template_name === template_name;
    });

    return activeTemplates;
  };

  render() {
    let validLists = this.props.userLists.filter((t) =>
      filterValidTemplates(
        t,
        this.props.activeTemplate,
        this.props.addType,
        this.props.commodityType
      )
    );

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

    const dropdownOptionsInvestmentCommodity = buildDropdownOptions(validLists, 'list_name');
    return (
      <div className={'locations-upload-step'}>
        <h2 className="locations-upload-step__step-title">{locationsPage.upload.stepFourTitle}</h2>

        <fieldset className="locations-upload-save">
          <legend className="locations-upload-save__legend">{locationsPage.upload.analytics}</legend>
          <div className="locations-upload-save__option-container">
            <input type='checkbox' name='florest_change_global' id='florest_change_global' />
            <label htmlFor="florest_change_global">Forest Change Global</label>
          </div>

          <div className="locations-upload-save__option-container">
            <input type='checkbox' name='florest_change_south_america' id='florest_change_south_america' />
            <label htmlFor="florest_change_south_america">Forest Change South America</label>
          </div>

          <div className="locations-upload-save__option-container">
            <input type='checkbox' name='florest_change_southeast_asia' id='florest_change_southeast_asia' />
            <label htmlFor="florest_change_southeast_asia">Forest Change Southeast Asia</label>
          </div>

          <div className="locations-upload-save__option-container">
            <input type='checkbox' name='palm_risk' id='palm_risk' />
            <label htmlFor="palm_risk">Palm Risk (only enabled for palm lists)</label>
          </div>

          <div className="locations-upload-save__option-container">
            <input type='checkbox' name='deforestation_reporting' id='deforestation_reporting' />
            <label htmlFor="deforestation_reporting">Deforestation Reporting (cutoff date 2020)</label>
          </div>

          <div className="locations-upload-save__option-container">
            <input type='checkbox' name='near_real_time_alerts' id='near_real_time_alerts' />
            <label htmlFor="near_real_time_alerts">Near-real time alerts (GLAD, VIIRS)</label>
          </div>
        </fieldset>

        <fieldset className="locations-upload-save">
          <legend className="locations-upload-save__legend">{locationsPage.upload.list}</legend>

          <div className="locations-upload-save__option-container">
            <input
              type="radio"
              name="addToNewOrExistingList"
              id="addToExistingList"
              checked={!this.state.createNewList}
              onChange={(evt) => {
                if (evt.target.checked) {
                  this.setState({ createNewList: false });
                  this.props.updateSelected(this.state._selectedExistingList);
                }
              }}
            />

            <label htmlFor="addToExistingList" className="locations-upload-save__label">
              {locationsPage.upload.addToExisting}
            </label>

            <GfwSelect
              className="locations-upload-save__optl-input"
              placeholder={locationsPage.upload.selectPlaceholder}
              options={dropdownOptionsInvestmentCommodity.dropdownOptions}
              value={this.props.selectedList}
              onChange={(val) => {
                this.setState({ _selectedExistingList: val });
                this.props.updateSelected(val);
              }}
            />
          </div>

          <div className="locations-upload-save__option-container">
            <input
              type="radio"
              name="addToNewOrExistingList"
              id="addToNewList"
              checked={this.state.createNewList}
              onChange={(evt) => {
                if (evt.target.checked) {
                  this.setState({ createNewList: true });
                  // A new list will be created by the parent component if the name of the
                  // selected list is an empty string.
                  // updateSelected expects to receive an object with a 'value' key because it
                  // is triggered by the dropdown's onChange event, so we mimic that when we
                  // call it manually.
                  this.props.updateSelected({ value: '' });
                  this.props.updateCustomList(this.state._newListName);
                }
              }}
            />
            <label htmlFor="addToNewList" className="locations-upload-save__label">
              {locationsPage.upload.createNew}
            </label>

            {this.state.createNewList && (
              <div className="locations-upload-save__optl-input">
                <input
                  value={this.props.customList}
                  onChange={(evt) => {
                    this.setState({ _newListName: evt.target.value });
                    this.props.updateCustomList(evt.target.value);
                  }}
                  className="locations-add-dropdown"
                />
              </div>
            )}
          </div>
        </fieldset>
      </div>
    );
  }
}
