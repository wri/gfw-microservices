import React, { Component } from 'react';

import GfwSelect from '../../../../common/js/components/GfwSelect';
import { buildDropdownOptions } from '../../../../common/js/utils/buildDropdownOptions';
import { deduceActiveName } from '../../../../common/js/utils/templateUtils';
import { filterValidTemplates } from '../../utils/moveLocations';

export default class StepThreeGFW extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.addType === 'investment' && nextProps.step === 3 && this.props.step !== 3) {
      let locationClassification = 'Recent Investments';
      if (this.checkExistingList(locationClassification)) {
        let count = 1;
        while (this.checkExistingList(locationClassification)) {
          const result = locationClassification.match(/([0-9]+)$/);
          let num = 0;
          if (result !== null) {
            num = parseInt(result[0]);
            locationClassification = `${locationClassification.substring(0, result.index)}${num + 1}`;
          } else {
            locationClassification = `${locationClassification} ${count}`;
          }
          count++;
        }
      }
      this.props.updateCustomList(locationClassification);
    } else if (nextProps.addType === 'commodity' && nextProps.step === 3 && this.props.step !== 3) {
      let newListName;
      const type = nextProps.activeTemplate === 'generic' ? nextProps.commodityType : nextProps.activeTemplate;
      if (nextProps.commodityType !== 'other') {
        newListName = deduceActiveName(type);
      } else {
        newListName = nextProps.otherCommodityType;
      }
      let locationClassification = `Recent ${newListName}`;
      if (this.checkExistingList(locationClassification)) {
        let count = 1;
        while (this.checkExistingList(locationClassification)) {
          const result = locationClassification.match(/([0-9]+)$/);
          let num = 0;
          if (result !== null) {
            num = parseInt(result[0]);
            locationClassification = `${locationClassification.substring(0, result.index)}${num + 1}`;
          } else {
            locationClassification = `${locationClassification} ${count}`;
          }
          count++;
        }
      }
      this.props.updateCustomList(locationClassification);
    }
  }

  checkExistingList(locationClassification) {
    let result = false;
    this.props.orgLists.some((list) => {
      if (list.list_name === locationClassification) {
        result = true;
      }
    });
    return result;
  }

  render() {
    const validLists = this.props.userLists.filter(
      filterValidTemplates(this.props.activeTemplate, this.props.addType, this.props.commodityType)
    );
    const dropdownOptionsInvestmentCommodity = buildDropdownOptions(validLists, 'list_name');

    return (
      <div className={`locations-upload-step ${this.props.step === 3 ? '' : 'hidden'}`}>
        <div className="locations-subpage-header subtitle page-heading">
          Add Selected Global Forest Watch List Location(s)
        </div>
        <p className="locations-subpage-header__steps">Step 3 of 3</p>
        <div className="locations-subpage-header subtitle">Import Lists</div>
        <p>
          Choose where to save selected Global Forest Watch location(s). Please note that only compatible locations can
          belong to the same list, i.e. same location classification, same location or commodity type and/or location
          template.
        </p>
        <section className="list-import-options__item">
          <div className="locations-upload-list-label bold-list">Create New List:</div>
          <span>
            <input
              value={this.props.customList}
              onChange={this.props.updateCustom}
              className="locations-add-dropdown"
            />
          </span>
        </section>
        <div className="locations-upload-list-label">Add selected location(s) to create a new list.</div>

        <section className="list-import-options__item">
          <div className="locations-upload-list-label bold-list">Add to Existing List:</div>
          <div className="create-new-list__dropdown">
            <GfwSelect
              placeholder="Create new list"
              options={dropdownOptionsInvestmentCommodity.dropdownOptions}
              value={this.props.selectedList}
              onChange={this.props.updateSelected}
            />
          </div>
        </section>
        <div className="locations-upload-list-label">Add selected location(s) to an existing list.</div>
      </div>
    );
  }
}
