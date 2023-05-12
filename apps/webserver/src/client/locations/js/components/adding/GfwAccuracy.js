import { locationsPage } from '../../../../common/js/config';
import React, { Component } from 'react';

export default class GfwAccuracy extends Component {
  createOptions = (option, i) => {
    return (
      <option
        onClick={this.props.updateAccuracy}
        id={option.id}
        key={i}
        className={`locations-instructions-option ${this.props.accuracy === option.label ? 'selected' : ''}`}
      >
        {option.label}
      </option>
    );
  };

  render() {
    const options = locationsPage.add.accuracyOptions.map(this.createOptions);

    return (
      <div className={`locations-subpage-accuracy ${this.props.hidden ? 'hidden' : ''}`}>
        <div className="locations-adding-header">
          <h3 className="locations-adding-header__label subtitle">Accuracy Index</h3>
          <p className="locations-subpage-header__label">
            WRI’s confidence level in the selected Global Forest Watch list
          </p>
        </div>
        {options}
      </div>
    );
  }
}
