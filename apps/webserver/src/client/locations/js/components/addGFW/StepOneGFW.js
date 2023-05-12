import { changeAddType, changeTemplate } from '../../actions/locationActions';
import { locationsPage } from '../../../../common/js/config';
import store from '../../store';
import React, { Component } from 'react';

export default class StepOneGFW extends Component {
  changeAddType = (evt) => {
    let addType;
    if (evt.target.name === 'investment-upload-gfw') {
      addType = 'investment';
      store.dispatch(changeTemplate(addType));
    } else if (evt.target.name === 'commodity-upload-gfw') {
      addType = 'commodity';
      if (
        this.props.selectedLists[0].list_name === 'RSPO Palm Concessions' ||
        this.props.selectedLists[0].list_name === 'Oil Palm Concessions'
      ) {
        store.dispatch(changeTemplate('palmGeneric'));
      } else {
        if (this.props.commodityType === 'multiple') {
          // multiple is not a valid commodity type when addType is commodity,
          // so we need to change it to other when selecting commodity if multiple
          // is the active commodity type. This function expects an event.
          this.props.updateCommodityType({ target: { value: 'other' } });
        }
        const commodityConfigItem = locationsPage.upload.commodityTypeOptions.filter(
          (o) => o.id === this.props.commodityType
        )[0];
        const template = commodityConfigItem.commodityTemplate || 'generic';

        store.dispatch(changeTemplate(template));
      }
    }
    store.dispatch(changeAddType(addType));
  };

  createRadio = (option, i) => {
    if (!(this.props.addType === 'commodity' && option.name === 'Multiple')) {
      return (
        <div className="commodity-option__container" key={i + 'spanKey'}>
          <input
            type="radio"
            onChange={this.props.updateCommodityType}
            checked={this.props.commodityType === option.id}
            value={option.id}
            id={`${option.id}RadioType-gfw`}
            key={i}
            className="commodity-option"
          />
          <label htmlFor={`${option.id}RadioType-gfw`} className="commodity-option-label">
            {option.name}
          </label>
        </div>
      );
    }
  };

  filterOptions = (option) => {
    if (
      this.props.selectedLists.length > 0 &&
      (this.props.selectedLists[0].list_name === 'RSPO Palm Concessions' ||
        this.props.selectedLists[0].list_name === 'Oil Palm Concessions' ||
        this.props.selectedLists[0].list_name === 'Palm Oil Mills')
    ) {
      return option.id === 'palmOil';
    } else if (
      this.props.selectedLists.length > 0 &&
      (this.props.selectedLists[0].list_name === 'Administrative Areas' ||
        this.props.selectedLists[0].list_name === 'Protected Areas')
    ) {
      return true;
    } else {
      return false;
    }
  };

  render() {
    const list_name = this.props.selectedLists.length > 0 ? this.props.selectedLists[0].list_name : '';
    return (
      <div className={`locations-upload-step ${this.props.step === 1 ? '' : 'hidden'}`}>
        <h2 className="locations-subpage-header subtitle page-heading">
          Add Selected Global Forest Watch List Location(s)
        </h2>
        <p className="locations-subpage-header__steps">Step 1 of 3</p>
        <div className="locations-subpage-subheader subtitle">Select Type of Location(s):</div>
        <div id="locationsTypeOptions">
          <div className={`${list_name === 'Palm Oil Mills' ? 'hidden' : ''}`}>
            <input
              type="radio"
              id="investment-upload-gfw"
              name="investment-upload-gfw"
              value={locationsPage.landing.investment}
              checked={this.props.addType === 'investment'}
              onChange={this.changeAddType}
            />
            <label htmlFor="investment-upload-gfw" className="locations-select-type-label">
              {locationsPage.landing.investment}
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="commodity-upload-gfw"
              name="commodity-upload-gfw"
              value={locationsPage.landing.commodity}
              checked={this.props.addType === 'commodity'}
              onChange={this.changeAddType}
            />
            <label htmlFor="commodity-upload-gfw" className="locations-select-type-label">
              {locationsPage.landing.commodity}
            </label>
          </div>
        </div>
        <div className="locations-subpage-subheader">Select Commodity Type:</div>
        <div id="commodityTypeOptions">
          {locationsPage.upload.commodityTypeOptions.filter(this.filterOptions).map(this.createRadio)}
          <input
            className={`locations-upload-other-name ${
              this.props.addType === 'commodity' ? 'commodity-other' : 'investment-other'
            } ${this.props.commodityType === 'other' ? '' : 'hidden'}`}
            value={this.props.otherCommodityType}
            onChange={this.props.updateOtherCommodityType}
          />
        </div>
      </div>
    );
  }
}
