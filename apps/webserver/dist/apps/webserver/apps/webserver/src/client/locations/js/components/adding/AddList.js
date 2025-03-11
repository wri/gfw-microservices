import React from 'react';
import { locationsPage } from '../../../../common/js/config';
import { deduceActiveId, deduceActiveName } from '../../../../common/js/utils/templateUtils';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import { filterValidCustom } from '../../../../listDetails/js/utils/moveLocations';
import { getListValidStatus } from '../../utils/lists.utils';

function AddList(props) {
  // TODO: resolve this version and the one in locations/js/utils/movelocations.js,
  // which does not check the classification
  const filterValidTemplates = (template) => {
    let templateId = 1;
    let sameClassification = true;
    const validListStatus = getListValidStatus(template.list_status_id);
    if (props.addType === 'commodity') {
      templateId = deduceActiveId(props.activeTemplate);

      if (
        props.selectedLocationClassification &&
        template &&
        template.location_classification &&
        props.selectedLocationClassification.toLowerCase() !==
          template.location_classification.toLowerCase()
      ) {
        sameClassification = false;
      }

      if (template && template.template_id === 1 && !template.location_classification) {
        sameClassification = false;
      }
    }

    return template && template.template_id === templateId && validListStatus && sameClassification;
  };

  const getActive = () => {
    const template_name = deduceActiveName(props.activeTemplate);

    const activeTemplates = props.commodityTemplates.filter((template) => {
      return template.template_name === template_name;
    });

    return activeTemplates;
  };

  let validLists = props.userLists.filter(filterValidTemplates);

  if (props.addType === 'commodity') {
    const customFields = [];
    const activeTemplates = getActive();
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

  const dropdownOptionsInvestmentCommodity = buildDropdownOptions(
    validLists,
    'list_name'
  ).dropdownOptions;
  const addToExistingList = props.selectedList !== 'Create New List' && validLists.length > 0;

  return (
    <div className="locations-adding">
      <div className="locations-adding__header">
        <h3 className="locations-adding__title">{locationsPage.add.addToListTitle}</h3>
        <p className="locations-adding__prompt">{locationsPage.add.addToListDesc}</p>
      </div>

      <div>
        <div
          className={`input-field__block-container ${!validLists.length ? 'disabled-radio' : ''}`}
        >
          <input
            type="radio"
            name="addToNewOrExistingList"
            id="addToExistingList"
            checked={addToExistingList}
            disabled={!validLists.length}
            onChange={(evt) => {
              if (evt.target.checked && dropdownOptionsInvestmentCommodity.length > 0) {
                props.updateList(dropdownOptionsInvestmentCommodity[0].value);
              } else {
                props.updateList('');
              }
            }}
          />
          <label htmlFor="addToExistingList">{locationsPage.add.addToListInstructions}</label>
          {addToExistingList && (
            <GfwSelect
              id="add-to-existing-list"
              className="locations-upload-save__optl-input"
              options={dropdownOptionsInvestmentCommodity}
              value={props.selectedList}
              onChange={(e) => props.updateList(e.value)}
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
                props.clearAddToListDropdown();
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
                key={props.activeTemplate}
                value={props.newListName}
                placeholder={props.listPlaceholderValue}
                onChange={props.updateNewListName}
                onBlur={props.trimNewListName}
                className="locations-adding__new-list-name locations-upload-save__optl-input"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddList;
