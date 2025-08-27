import { useState, useEffect, useRef } from 'react';
import Graphic from '@arcgis/core/Graphic';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import * as projection from '@arcgis/core/geometry/projection';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import { locationsPage } from '../../../../../common/js/config';
import DrawIcon from '@mui/icons-material/Draw';
import {
  addCoordinateTextFromPoint,
  addCoordinateTextFromPolygon,
} from '../../../utils/polygonCoordinatesUtils';
import './LocationMapDrawer.scss';

const DrawShapeMode = {
  Active: 'active',
  Inactive: 'inactive',
  Drawing: 'drawing',
  Complete: 'complete',
};

export const LocationMapDrawer = ({
  geomFromMap,
  mapView,
  sketchViewModel,
  setSketchViewModel,
  updateGeometry,
}) => {
  const [mode, setMode] = useState(DrawShapeMode.Inactive);
  const modeRef = useRef(mode);
  const hoverGraphicsRef = useRef([]);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Hover event
  useEffect(() => {
    const handleMouseMove = (event) => {
      // Remove previous hover graphics
      hoverGraphicsRef.current.forEach((graphic) => {
        mapView.graphics.remove(graphic);
      });
      hoverGraphicsRef.current = [];
      if (modeRef.current !== DrawShapeMode.Drawing) {
        return;
      }

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      hoverTimeoutRef.current = setTimeout(() => {
        const point = mapView.toMap({ x: event.x, y: event.y });

        const textGraphic = addCoordinateTextFromPoint(mapView, point);
        hoverGraphicsRef.current.push(textGraphic);
      }, 300);
    };

    const mapViewHandler = mapView.on('pointer-move', handleMouseMove);

    return () => {
      mapViewHandler.remove();
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverGraphicsRef.current.forEach((graphic) => {
        mapView.graphics.remove(graphic);
      });
    };
  }, [mapView]);

  useEffect(() => {
    // Initialize Draw Tool
    const sketchViewModelInstance = new SketchViewModel({
      view: mapView,
      layer: mapView.graphics,
      polygonSymbol: {
        type: 'simple-fill',
        color: [0, 0, 0, 0.65],
        outline: {
          color: [0, 0, 0, 1],
          width: 1,
        },
      },
    });

    setSketchViewModel(sketchViewModelInstance);

    if (geomFromMap) {
      setDrawPoly(mapView, geomFromMap);
    }

    // Add coordinates on click
    mapView.on('click', (event) => {
      if (modeRef.current === DrawShapeMode.Drawing) {
        const point = event.mapPoint;
        addCoordinateTextFromPoint(mapView, point);
      }
    });

    // Listen for double click to finish polygon
    let doubleClickHandler = mapView.on('double-click', (event) => {
      if (modeRef.current === DrawShapeMode.Drawing) {
        const point = event.mapPoint;
        addCoordinateTextFromPoint(mapView, point);
        sketchViewModelInstance.complete();
      }
    });

    sketchViewModelInstance.on('create', ({ graphic, state }) => {
      if (state === DrawShapeMode.Complete) {
        const polygon = graphic.geometry;
        const lastPoint = polygon.getPoint(0, polygon.rings[0].length - 1);
        addCoordinateTextFromPoint(mapView, lastPoint);
        setDrawPoly(mapView, polygon);
        setMode(DrawShapeMode.Complete);
      } else if (state === DrawShapeMode.Active) {
        const polygon = graphic.geometry;
        const vertexCount = polygon?.rings?.[0]?.length || 0;
        if (vertexCount > 11) {
          // Automatically complete the drawing when 11 vertices are reached
          // the shape should have 10 vertices but to close the polygon we need an extra point in the start
          sketchViewModelInstance.complete();
        }
      }
    });

    return () => {
      if (doubleClickHandler) {
        doubleClickHandler.remove();
      }
    };
  }, [mapView, mode]);

  const onDrawButtonClick = () => {
    if (mode === DrawShapeMode.Inactive) {
      mapView.graphics.removeAll();
      sketchViewModel.create('polygon');
      setMode(DrawShapeMode.Drawing);
    } else if (mode === DrawShapeMode.Drawing) {
      sketchViewModel.cancel();
      setMode(DrawShapeMode.Inactive);
    } else if (mode === DrawShapeMode.Complete) {
      mapView.graphics.removeAll();
      sketchViewModel.delete();
      sketchViewModel.create('polygon');
      setMode(DrawShapeMode.Drawing);
    } else {
      console.warn(`No defined action for MODE ${mode}`);
    }
  };

  const setDrawPoly = (mapView, geom) => {
    mapView.graphics.removeAll();

    let polygon = new Polygon(geom);

    // Check if the geometry is not in wkid 4326, and if not, project it
    if (!polygon.spatialReference.isWGS84) {
      polygon = projection.project(polygon, SpatialReference.WGS84);
    }
    polygon = geometryEngine.simplify(polygon);

    const fillSymbol = new SimpleFillSymbol({
      color: [151, 189, 61, 0.65],
      outline: {
        color: [151, 189, 61, 1],
        width: 1,
      },
    });
    const polygonGraphic = new Graphic({
      geometry: polygon,
      symbol: fillSymbol,
    });
    mapView.graphics.add(polygonGraphic);

    addCoordinateTextFromPolygon(polygon, mapView);

    if (polygon && polygon.centroid) {
      setTimeout(() => {
        mapView.goTo(
          {
            target: [polygon.centroid],
          },
          { duration: 1000 }
        );
      }, 500);
    }

    updateGeometry(polygon);
    gtag('event', 'add location map draw', {
      event_category: 'Locations Draw',
      event_label: 'user drew a polygon on the Add Location map',
    });
  };

  let buttonTitle;
  switch (mode) {
    case DrawShapeMode.Inactive:
      buttonTitle = locationsPage.add.draw.button.startDrawing;
      break;
    case DrawShapeMode.Drawing:
      buttonTitle = locationsPage.add.draw.button.cancel;
      break;
    case DrawShapeMode.Complete:
      buttonTitle = locationsPage.add.draw.button.redraw;
      break;
    default:
      buttonTitle = 'INVALID STATE';
  }

  return (
    <button type="button" className="draw-shape__draw-button" onClick={onDrawButtonClick}>
      <DrawIcon />
      <span>{buttonTitle}</span>
    </button>
  );
};
