import React, { useState, useEffect } from 'react';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import PolygonCoordinatesInput from './PolygonCoordinates/PolygonCoordinatesInput';
import './AddLocationMap.scss';

const AddLocationMap = (props) => {
  const { geomFromMap } = props;
  const [mapView, setMapView] = useState(null);
  const [sketchViewModel, setSketchViewModel] = useState(null);

  useEffect(() => {
    initMap();
    return cleanup;
  }, [geomFromMap]);

  const cleanup = () => {
    if (sketchViewModel) {
      sketchViewModel.destroy();
    }
    if (mapView) {
      mapView.destroy();
    }
  };

  const initMap = () => {
    new MapView({
      container: 'mapView',
      center: [0, 16.53],
      zoom: 3,
      map: new EsriMap({
        basemap: 'hybrid',
      }),
    }).when((mapViewInstance) => {
      setMapView(mapViewInstance);
    });
  };

  return (
    <div className="add-location-map">
      <div className="add-location-map__map-container">
        {mapView && (
          <PolygonCoordinatesInput
            mapView={mapView}
            sketchViewModel={sketchViewModel}
            setSketchViewModel={setSketchViewModel}
            {...props}
          />
        )}
        <div className="add-location-map__map" id="mapView"></div>
      </div>
    </div>
  );
};

export default AddLocationMap;
