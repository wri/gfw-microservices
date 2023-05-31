import { locationsPage } from '../../../../common/js/config';
import SetArea from './SetArea';
import Search from 'esri/widgets/Search';
import Point from 'esri/geometry/Point';
import EsriMap from 'esri/Map';
import MapView from 'esri/views/MapView';
import React, { Component } from 'react';

export default class SelectAddress extends Component {
  componentDidMount() {
    const promise = new MapView({
      container: this.refs.mapView,
      center: [0, 16.53],
      zoom: 3,
      map: new EsriMap({
        basemap: 'national-geographic',
      }),
    });

    promise.when(this.mapLoaded);
  }

  componentDidUpdate(prevProps) {
    if (
      this.searchWidget &&
      (!this.props.hasGeometry || prevProps.addMethod !== this.props.addMethod)
    ) {
      this.searchWidget.clear();
    }
  }

  mapLoaded = (mapView) => {
    this.searchWidget = new Search({
      view: mapView,
      container: 'searchDiv',
    });

    this.searchWidget.on('select-result', (evt) => {
      const geom = new Point({
        latitude: evt.result.feature.geometry.latitude,
        longitude: evt.result.feature.geometry.longitude,
      });
      this.props.setGeometry(geom);
      gtag('event', 'add location enter address', {
        'event_category': 'Locations Enter',
        'event_label': 'user entered an address in the add location page',
      });
    });
  };

  setArea = (evt) => {
    this.props.setArea(evt.target.id, '');
  };

  setCustom = (evt) => {
    if (!isNaN(evt.target.value)) {
      this.props.setArea('', evt.target.value);
    }
  };

  render() {
    return (
      <div className="locations-method-address">
        <label className="block-label">{locationsPage.add.address}</label>

        <div id="searchDiv" className="locations-subpage-address-search"></div>
        <div ref="mapView" className="locations-subpage-address-container"></div>
        {this.props.hasGeometry && (
          <SetArea
            measurementUnit={this.props.measurementUnit}
            setMeaurementUnit={this.props.setMeaurementUnit}
            areaAround={this.props.areaAround}
            customArea={this.props.customArea}
            calculatedArea={this.props.calculatedArea}
            setCustom={this.setCustom}
            setArea={this.setArea}
          />
        )}
      </div>
    );
  }
}
