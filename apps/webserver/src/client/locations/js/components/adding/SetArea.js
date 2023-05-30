import { numberWithCommas } from '../../utils/locationsTableUtils';
import { locationsPage } from '../../../../common/js/config';
import IconLightbulb from '../../../../common/js/components/icon/IconLightbulb';

import React, { Component } from 'react';

const AREA_SELECTIONS = {
  SMALL: 'small-area',
  MEDIUM: 'medium-area',
  LARGE: 'large-area',
  CUSTOM: 'custom-area',
  NONE: 'none',
};

export default class SetArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      areaSelection: AREA_SELECTIONS.NONE,
    };
  }

  render() {
    const strings = locationsPage.add;
    return (
      <div className="locations-set-area">
        <p className="locations-set-area__title">{strings.defineRadiusHeader}</p>
        <div className="add-location-card__radio-group">
          <div className="add-location-radius-option">
            <input
              type="radio"
              name="areaSmMdLg"
              id="small-area"
              checked={this.state.areaSelection === AREA_SELECTIONS.SMALL}
              onChange={(evt) => {
                this.setState({ areaSelection: AREA_SELECTIONS.SMALL });
                this.props.setArea(evt);
              }}
            />
            <label htmlFor="small-area">{strings.smallArea}</label>
            <div className="area-radius-hint">{strings.smallAreaSizeHint}</div>
          </div>

          <div className="add-location-radius-option">
            <input
              type="radio"
              name="areaSmMdLg"
              id="medium-area"
              onChange={(evt) => {
                this.setState({ areaSelection: AREA_SELECTIONS.MEDIUM });
                this.props.setArea(evt);
              }}
              checked={this.state.areaSelection === AREA_SELECTIONS.MEDIUM}
            />
            <label htmlFor="medium-area">{strings.mediumArea}</label>
            <div className="area-radius-hint">{strings.mediumAreaSizeHint}</div>
          </div>

          <div className="add-location-radius-option">
            <input
              type="radio"
              name="areaSmMdLg"
              id="large-area"
              onChange={(evt) => {
                this.setState({ areaSelection: AREA_SELECTIONS.LARGE });
                this.props.setArea(evt);
              }}
              checked={this.state.areaSelection === AREA_SELECTIONS.LARGE}
            />
            <label htmlFor="large-area">{strings.largeArea}</label>
            <div className="area-radius-hint">{strings.largeAreaSizeHint}</div>
          </div>

          <div className="add-location-radius-option">
            <input
              type="radio"
              name="areaSmMdLg"
              id="custom-area"
              onChange={() => {
                this.setState({ areaSelection: AREA_SELECTIONS.CUSTOM });
              }}
              checked={this.state.areaSelection === AREA_SELECTIONS.CUSTOM}
            />
            <label htmlFor="custom-area">{strings.customArea}</label>
            {this.state.areaSelection === AREA_SELECTIONS.CUSTOM && (
              <div className="locations-set-area__custom-container">
                <div className="locations-set-area__input-container">
                  <label htmlFor="custom-area-input" className="block-label">
                    {strings.customAreaInputLabel}
                  </label>

                  <input
                    id="custom-area-input"
                    className="locations-set-area__input"
                    value={this.props.customArea}
                    title={strings.customAreaPlaceholder}
                    onChange={this.props.setCustom}
                  />
                  <div className="toggle-button">
                    <div
                      id="use-hectares"
                      onClick={this.props.setMeaurementUnit}
                      className={`toggle-button__option address-sub-area-label-area ${
                        this.props.measurementUnit === 'hectares'
                          ? 'selected toggle-button__option--selected'
                          : ''
                      }`}
                    >
                      <span className="toggle-button__text">{strings.hectareAbbrev}</span>
                    </div>
                    <div
                      id="use-kilometers"
                      onClick={this.props.setMeaurementUnit}
                      className={`toggle-button__option address-sub-area-label-area ${
                        this.props.measurementUnit === 'kilometers'
                          ? 'selected toggle-button__option--selected'
                          : ''
                      }`}
                    >
                      <span className="toggle-button__text">{strings.kilometerAbbrev}</span>
                    </div>
                  </div>
                </div>

                {this.props.measurementUnit === 'kilometers' && (
                  <div className="locations-set-area__calculation-text">
                    {strings.calculatedSourcingArea}:
                    <span className="locations-set-area__calculation-num">
                      {this.props.calculatedArea === 0
                        ? ''
                        : numberWithCommas(this.props.calculatedArea)}
                    </span>
                  </div>
                )}

                <div className="locations-set-area__note note">
                  <div className="note__inner">
                    <div className="note__header">
                      <IconLightbulb className="note__icon" />
                      <span className="note__title">{strings.help}</span>
                    </div>
                    {this.props.measurementUnit === 'kilometers' ? (
                      <>
                        <p className="address-sub-area-label">{strings.suggestedRadii}</p>
                        <ul>
                          <li className="address-sub-area-label">{strings.fiftyKmPalm}</li>
                          <li className="address-sub-area-label">{strings.thirtyKmSoy}</li>
                          <li className="address-sub-area-label">
                            {numberWithCommas(0.5) + strings.dash18KmCocoa}
                          </li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="address-sub-area-label">{strings.suggestedAreas}</p>
                        <ul>
                          <li className="address-sub-area-label">
                            {numberWithCommas(785000) + strings.haPalm}
                          </li>
                          <li className="address-sub-area-label">
                            {numberWithCommas(283000) + strings.haSoy}
                          </li>
                          <li className="address-sub-area-label">
                            {strings.eightyDash + numberWithCommas(102000) + strings.haCocoa}
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
