import React, { Component } from 'react';
import Search from '@arcgis/core/widgets/Search';
import Point from '@arcgis/core/geometry/Point';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import { locationsPage } from '../../../../common/js/config';
import SetArea from './SetArea';
import { NEW_LOCATION_AREA_OPTIONS } from './areaOptions.constants';

export default class SelectAddress extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedAreaRadioOption: NEW_LOCATION_AREA_OPTIONS.SMALL.id,
    };
  }
  componentDidMount() {
    const nationalGeographicStyleId = 'f33a34de3a294590ab48f246e99958c9';

    const promise = new MapView({
      container: this.refs.mapView,
      center: [0, 16.53],
      zoom: 3,
      map: new WebMap({
        portalItem: {
          id: nationalGeographicStyleId,
        },
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

  setSelectedAreaRadioOption = (option) => {
    this.setState({
      selectedAreaRadioOption: option,
    });
  };
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
        event_category: 'Locations Enter',
        event_label: 'user entered an address in the add location page',
      });
    });
  };

  render() {
    return (
      <div className="locations-method-address">
        <label className="block-label">{locationsPage.add.address}</label>

        <div id="searchDiv" className="locations-subpage-address-search"></div>
        <div ref="mapView" className="locations-subpage-address-container"></div>
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
