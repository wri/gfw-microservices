import React, { Component } from 'react';
import Point from '@arcgis/core/geometry/Point';
import SetArea from './SetArea';
import { locationsPage } from '../../../../common/js/config';
import { NEW_LOCATION_AREA_OPTIONS } from './areaOptions.constants';

export default class SearchCoordinates extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedAreaRadioOption: NEW_LOCATION_AREA_OPTIONS.SMALL.id,
    };
  }
  setSelectedAreaRadioOption = (option) => {
    this.setState({
      selectedAreaRadioOption: option,
    });
  };
  updateLat = (evt) => {
    const lastChar = evt.target.value.charAt(evt.target.value.length - 1);
    if (
      lastChar === '.' ||
      isNaN(parseInt(lastChar)) === false ||
      !lastChar ||
      evt.target.value === '-'
    ) {
      this.props.setLat(evt);

      if (this.props.lng && lastChar && lastChar !== '.' && lastChar !== '-') {
        this.searchAdmin(evt.target.value, 'lat');
      }
    }
  };

  updateLng = (evt) => {
    const lastChar = evt.target.value.charAt(evt.target.value.length - 1);
    if (
      lastChar === '.' ||
      isNaN(parseInt(lastChar)) === false ||
      !lastChar ||
      evt.target.value === '-'
    ) {
      this.props.setLng(evt);

      if (this.props.lat && lastChar && lastChar !== '.' && lastChar !== '-') {
        this.searchAdmin(evt.target.value, 'lng');
      }
    }
  };

  searchAdmin = (value, latOrLng) => {
    let { lat, lng } = this.props;

    if (latOrLng === 'lat') {
      lat = value;
    } else if (latOrLng === 'lng') {
      lng = value;
    }

    const geom = new Point({
      latitude: lat,
      longitude: lng,
    });
    this.props.setGeometry(geom);
    gtag('event', 'add location enter coordinates', {
      event_category: 'Locations Enter',
      event_label: 'user entered latitude and longitude in the add location page',
    });
  };

  render() {
    const { country, state, substate } = this.props;
    return (
      <div className="locations-add-subpage coordinates-form">
        <section className="coordinates-form__inner">
          <div className="latitude__container coordinates-form__input-container">
            <label htmlFor="locations-subpage-coord-latitude" className="block-label">
              {locationsPage.add.latitude}
            </label>
            <input
              id="locations-subpage-coord-latitude"
              onChange={this.updateLat}
              value={this.props.lat}
              className="locations-subpage-coord"
            />
          </div>
          <div className="longitude__container coordinates-form__input-container">
            <label htmlFor="locations-subpage-coord-longitude" className="block-label">
              {locationsPage.add.longitude}
            </label>
            <input
              id="locations-subpage-coord-longitude"
              onChange={this.updateLng}
              value={this.props.lng}
              className="locations-subpage-coord"
            />
          </div>
        </section>
        {country && (
          <div className="coordinates-form__coord-text">
            <span>{locationsPage.add.locationLabel}</span>
            <span className="coordinates-form__coord-info">
              {substate ? `${substate},` : ''} {state ? `${state},` : ''} {country ? country : ''}
            </span>
          </div>
        )}
        {this.props.hasGeometry && (
          <SetArea
            selectedAreaRadioOption={this.state.selectedAreaRadioOption}
            setSelectedAreaRadioOption={this.setSelectedAreaRadioOption}
            measurementUnit={this.props.measurementUnit}
            setMeasurementUnit={this.props.setMeasurementUnit}
            customArea={this.props.customArea}
            calculatedArea={this.props.calculatedArea}
            setCustomArea={(value) => {
              this.props.setArea('', value);
            }}
          />
        )}
      </div>
    );
  }
}
