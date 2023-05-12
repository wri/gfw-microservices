import { changeTemplate } from '../../../../locations/js/actions/locationActions';
import { locationsPage } from '../../../../common/js/config';
import store from '../../../../locations/js/store';
import React, { Component } from 'react';

export default class StepOne extends Component {
  changeAddType = (evt) => {
    const addType = evt.target.name === 'investment-upload' ? 'investment' : 'commodity';
    this.props.setAddType(addType);
    // clear the secondary radio selection on primary radio selection change
    this.props.updateCommodityType('');
    this.props.updateOtherCommodityType('');
  };

  toggleCommodityType = (evt) => {
    const newType = evt.target.value;
    this.props.updateCommodityType(newType);
    ga(
      'send',
      'event',
      'Upload Locations Select',
      'Upload locations template radio button clicked',
      `user selected ${newType} template for uploading locations`
    );
  };

  toggleOtherType = (evt) => {
    const newVal = evt.target.value;
    this.props.updateOtherCommodityType(newVal);
    ga(
      'send',
      'event',
      'Upload Locations Select',
      'Upload locations template radio button clicked',
      `user selected ${newVal} template for uploading locations`
    );
  };

  createRadio = (optionName, optionId, i) => {
    if (!(this.props.addType === 'commodity' && optionName === 'Multiple')) {
      return (
        <div className="commodity-option__container" key={i + 'spanKey'}>
          <input
            type="radio"
            onChange={this.toggleCommodityType}
            checked={this.props.commodityType === optionId}
            value={optionId}
            id={`${optionId}RadioType`}
            key={i}
            className="commodity-option"
          />
          <label htmlFor={`${optionId}RadioType`} className="commodity-option-label">
            {optionName}
          </label>
          {optionId === 'other' && (
            <input
              className={`locations-upload-other-name commodity-other
                     ${this.props.commodityType === 'other' ? '' : 'hidden'}`}
              value={this.props.otherCommodityType}
              onChange={this.toggleOtherType}
            />
          )}
        </div>
      );
    }
  };

  render() {
    const { addType } = this.props;
    const commodityOptions = locationsPage.upload.templateOptions;

    return (
      <div className="locations-upload-step">
        <h2 className="locations-upload-step__step-title">{locationsPage.upload.stepOneTitle}</h2>
        <div id="locationsTypeOptions" className="locations-upload-step__options">
          <input
            type="radio"
            id="investment-upload"
            name="investment-upload"
            value={locationsPage.landing.investment}
            checked={addType === 'investment'}
            onChange={this.changeAddType}
          />
          <label htmlFor="investment-upload" className="locations-select-type-label">
            {locationsPage.landing.investment}
          </label>
          <p className="locations-upload-step__option-description">
            {locationsPage.upload.investmentAddTypeDescription}
          </p>
          {addType === 'investment' && (
            <div className="locations-upload-step__suboptions">
              <div className="locations-upload-step__suboptions-description">
                {locationsPage.upload.investmentAddType}
              </div>
              <div id="locationsAddTypeOptions" className="locations-upload-step__suboptions-container">
                {locationsPage.upload.commodityTypeOptions.map((option) => {
                  return this.createRadio(option.name, option.id, option.id);
                })}
              </div>
            </div>
          )}
          <input
            type="radio"
            id="commodity-upload"
            name="commodity-upload"
            value={locationsPage.landing.commodity}
            checked={addType === 'commodity'}
            onChange={this.changeAddType}
          />
          <label htmlFor="commodity-upload" className="locations-select-type-label">
            {locationsPage.landing.commodity}
          </label>
          <p className="locations-upload-step__option-description">
            {locationsPage.upload.commodityAddTypeDescription}
          </p>
          {addType === 'commodity' && (
            <div className="locations-upload-step__suboptions">
              <div className="locations-upload-step__suboptions-description">
                {locationsPage.upload.commodityAddType}
              </div>
              <div id="commodityAddTypeOptions" className="locations-upload-step__suboptions-container">
                {Object.keys(commodityOptions).map((key) => {
                  const option = commodityOptions[key];
                  return this.createRadio(option.label, option.id, key);
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
