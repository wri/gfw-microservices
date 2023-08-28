import React, { Component } from 'react';

import GfwSelect from '../../../../common/js/components/GfwSelect';
import { locationsPage } from '../../../../common/js/config';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import { filterValidTemplates, filterValidCustom } from '../../utils/moveLocations';
import { analysisTypes } from '../../../../../config/env/analysisTypes.constants';
import { isEudrAvailable } from '../../../../../utils/general.utils';

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
      _selectedAnalysis: [],
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

  handleAnalyzesSelect = (type) => {
    const index = this.state._selectedAnalysis.indexOf(type);
    if (index > -1) {
      this.setState({ _selectedAnalysis: this.state._selectedAnalysis.splice(index, 1) });
      return;
    }

    this.setState({ _selectedAnalysis: [...this.state._selectedAnalysis, type] });
  };

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
    const { DEFORESTATION_KPIS, FOREST_CHANGE_DIAGNOSTICS, DEFORESTATION_ALERTS } = analysisTypes;
    const dropdownOptionsInvestmentCommodity = buildDropdownOptions(validLists, 'list_name');
    return (
      <div className={'locations-upload-step'}>
        <h2 className="locations-upload-step__step-title">{locationsPage.upload.stepFourTitle}</h2>
        
        {isEudrAvailable && (
          <fieldset className="locations-upload-save">
            <legend className="locations-upload-save__legend">
              {locationsPage.upload.analytics}
            </legend>
            <div className="locations-upload-save__option-container">
              <input
                type="checkbox"
                name={FOREST_CHANGE_DIAGNOSTICS}
                id={FOREST_CHANGE_DIAGNOSTICS}
                onChange={() => this.handleAnalyzesSelect(FOREST_CHANGE_DIAGNOSTICS)}
              />
              <label htmlFor={FOREST_CHANGE_DIAGNOSTICS}>{locationsPage.upload.analysis.florestChange}</label>
            </div>

            <div className="locations-upload-save__option-container">
              <input
                type="checkbox"
                name={DEFORESTATION_KPIS}
                id={DEFORESTATION_KPIS}
                onChange={() => this.handleAnalyzesSelect(DEFORESTATION_KPIS)}
              />
              <label htmlFor={DEFORESTATION_KPIS}>
                {locationsPage.upload.analysis.deflorestationReporting}
              </label>
            </div>

            <div className="locations-upload-save__option-container">
              <input
                type="checkbox"
                name={DEFORESTATION_ALERTS}
                id={DEFORESTATION_ALERTS}
                onChange={() => this.handleAnalyzesSelect(DEFORESTATION_ALERTS)}
              />
              <label htmlFor={DEFORESTATION_ALERTS}>{locationsPage.upload.analysis.deflorestationAlert}</label>
            </div>
          </fieldset>
        )}

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
