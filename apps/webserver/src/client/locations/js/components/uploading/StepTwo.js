import { locationsPage } from '../../../../common/js/config';
import DescribeInvestment from '../adding/DescribeInvestment';
import DescribeLocation from '../adding/DescribeLocation';

import React, { Component } from 'react';

export default class StepTwo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      investmentCurrency: null,
      investmentSize: null,
    };
  }

  updateInvestmentCurrency = (evt) => {
    this.setState({ investmentCurrency: evt.target.value });
  };

  updateInvestmentSize = (evt) => {
    const { value } = evt.target;
    // investmentSize is int type in the DB so we can not pass an empty sring
    // we need to pass null if the user types something then deletes it all
    this.setState({ investmentSize: value === '' ? null : value });
  };

  render() {
    const investmentTemplate = this.props.templateData.filter(
      (template) => template.location_type_name === 'Investment'
    );
    const commodityTemplate = this.props.templateData.filter(
      (template) => template.location_type_name === 'Commodity'
    );

    return (
      <div className="locations-upload-step">
        <h2 className="locations-upload-step__step-title">
          {locationsPage.add.additionalAttributes}
          <span className="locations-subpage-header__label optional">
            {locationsPage.add.optional}
          </span>
        </h2>

        <DescribeInvestment
          templateDropdowns={this.props.templateDropdowns}
          templateData={investmentTemplate}
          contentEditable={false}
          updateInvestmentCurrency={this.updateInvestmentCurrency}
          updateInvestmentSize={this.updateInvestmentSize}
          addType={this.props.addType}
          locationType={'multiple'}
        />
        <DescribeLocation
          customAttributeHeaders={this.props.customAttributeHeaders}
          templateDropdowns={this.props.templateDropdowns}
          templateData={commodityTemplate}
          contentEditable={false}
          commodityType={this.props.commodityType}
          editTemplate={this.props.editTemplate}
          activeTemplate={this.props.activeTemplate}
          addType={this.props.addType}
          locationType={'multiple'}
          required={false}
        />
      </div>
    );
  }
}
