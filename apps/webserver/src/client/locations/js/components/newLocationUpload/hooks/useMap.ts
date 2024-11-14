import { useEffect, useState } from 'react';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

import {
  extractCoordinates,
  addCoordinateTextFromPolygon,
} from '../../adding/PolygonCoordinates/polygonCoordinates.utils';

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { coordinateSchema } from '../utils/schema';

const generateEmptyCoordinate = () => ({ id: uuidv4(), latitude: '', longitude: '' });

type CoordinateType = z.infer<typeof coordinateSchema> & { id: string };

export const useMap = (geomFromMap: unknown) => {
  const [mapView, setMapView] = useState<unknown>(null);
  const [sketchViewModel, setSketchViewModel] = useState(null);
  const [geometry, setGeometry] = useState<unknown>(null);
  const [coordinates, setCoordinates] = useState<CoordinateType[]>([
    generateEmptyCoordinate(),
    generateEmptyCoordinate(),
    generateEmptyCoordinate(),
  ]);

  useEffect(() => {
    initMap();
    return cleanup;
  }, [geomFromMap]);

  const cleanup = () => {
    if (sketchViewModel) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sketchViewModel.destroy();
    }
    if (mapView) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
    }).when((mapViewInstance: unknown) => {
      setMapView(mapViewInstance);
    });
  };

  const updateGeometry = (geometry: unknown) => {
    const initialCoordinates = extractCoordinates(geometry);
    if (initialCoordinates.length > 0) {
      setCoordinates(initialCoordinates);
      setGeometry(geometry);
    }
  };

  const addGraphicToMap = (geometryToAdd: unknown, graphic: unknown) => {
    if (!mapView) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mapView.graphics.removeAll();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sketchViewModel?.delete();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mapView.graphics.add(graphic);

    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mapView?.goTo(
        {
          target: graphic,
        },
        { duration: 1000 }
      );
    }, 500);
    setGeometry(geometryToAdd);
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
