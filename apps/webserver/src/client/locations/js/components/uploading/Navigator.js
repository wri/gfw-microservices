import React, { Component } from 'react';
import '../../../css/navigator.scss';

import { locationsPage } from '../../../../common/js/config';

const totalSteps = 4;

export default class Navigator extends Component {
  clickedStepRow = (step) => {
    this.props.setStep(step);
  };

  // Allow sidebar navigation to any previous step
  rowEnabled = (fromStep, toStep) => {
    return toStep < fromStep;
  };

  render() {
    const { step } = this.props;
    const stepLabels = locationsPage.upload.stepSidebarLabels;
    return (
      <div className="navigator">
        <ul className="navigator__list">
          {[...Array(totalSteps).keys()].map((s) => {
            const stepLabel = stepLabels[s];
            const sidebarStep = s + 1;
            const selectedClass = sidebarStep === step ? 'navigator__list-item--selected' : '';
            return (
              <li key={sidebarStep} className={`navigator__list-item ${selectedClass}`}>
                <button
                  type="button"
                  aria-label={stepLabel}
                  disabled={!this.rowEnabled(step, sidebarStep)}
                  className="navigator__link"
                  onClick={(e) => this.clickedStepRow(sidebarStep)}
                >
                  <div className="navigator__number">{sidebarStep}</div>
                  <div className="navigator__label">{stepLabel}</div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
