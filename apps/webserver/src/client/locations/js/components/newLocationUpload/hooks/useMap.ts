import { useEffect, useRef, useState } from 'react';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';

import {
  extractCoordinates,
  addCoordinateTextFromPolygon,
} from '../../../utils/polygonCoordinatesUtils';

type Coordinate = { longitude: string; latitude: string; id: string };

export const useMap = (shouldLoadMap: boolean, initialAmountOfCoordinates: number) => {
  const [mapView, setMapView] = useState<MapView | null>(null);
  const mapViewRef = useRef<MapView | null>(null);
  const [sketchViewModel, setSketchViewModel] = useState<SketchViewModel | null>(null);
  const [geometry, setGeometry] = useState<Polygon | Polygon[] | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinate[]>(
    Array.from({ length: initialAmountOfCoordinates }, () => generateEmptyCoordinate())
  );

  useEffect(() => {
    if (!shouldLoadMap) {
      return;
    }

    initMap();
    return cleanup;
  }, [shouldLoadMap]);

  const cleanup = () => {
    if (sketchViewModel) {
      sketchViewModel.destroy();
    }
    if (mapViewRef.current) {
      mapViewRef.current.destroy();
      mapViewRef.current = null;
    }
  };

  const initMap = () => {
    const view = new MapView({
      container: 'mapView',
      center: [0, 16.53],
      zoom: 3,
      map: new EsriMap({
        basemap: 'hybrid',
      }),
    });
    mapViewRef.current = view;
    view
      .when((mapViewInstance: MapView) => {
        setMapView(mapViewInstance);
        // absorb rejection thrown when the view is destroyed before .when() resolves
      })
      .catch(Boolean);
  };

  const updateGeometry = (geometry: Polygon) => {
    const initialCoordinates = extractCoordinates(geometry);
    if (initialCoordinates.length > 0) {
      setCoordinates(initialCoordinates);
      setGeometry(geometry);
    }
  };

  const addGraphicToMap = (geometry: Polygon | Polygon[], graphic: Graphic) => {
    if (!mapView) {
      return;
    }

    mapView.graphics.removeAll();
    sketchViewModel?.delete();

    mapView.graphics.add(graphic);

    setTimeout(() => {
      mapView?.goTo(
        {
          target: graphic,
        },
        { duration: 1000 }
      );
    }, 500);
    setGeometry(geometry);
    addCoordinateTextFromPolygon(geometry, mapView);
  };

  return {
    mapView,
    sketchViewModel,
    setSketchViewModel,
    updateGeometry,
    geometry,
    coordinates,
    setCoordinates,
    addGraphicToMap,
    generateEmptyCoordinate,
  };
};

const generateEmptyCoordinate = () => ({ id: crypto.randomUUID(), latitude: '', longitude: '' });
