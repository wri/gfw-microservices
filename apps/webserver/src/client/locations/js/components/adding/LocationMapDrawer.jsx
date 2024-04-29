import React, { useState, useEffect } from 'react';
import Graphic from '@arcgis/core/Graphic';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import { locationsPage } from '../../../../common/js/config';
import DrawIcon from '@mui/icons-material/Draw';
import './LocationMapDrawer.scss';

const DrawShapeMode = {
  Active: 'active',
  Inactive: 'inactive',
  Drawing: 'drawing',
  Complete: 'complete',
};

const LocationMapDrawer = (props) => {
  const { geomFromMap, mapView, sketchViewModel, setSketchViewModel } = props;
  const [mode, setMode] = useState(DrawShapeMode.Inactive);

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
      setDrawPoly(mapView, geomFromMap, true);
    }

    sketchViewModelInstance.on('create', ({ graphic, state }) => {
      if (state === DrawShapeMode.Complete) {
        setDrawPoly(mapView, sketchViewModelInstance, graphic.geometry);
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
  }, [mapView]);

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

  const setDrawPoly = (mapView, sketchViewModel, geom, zoomTo = false) => {
    mapView.graphics.removeAll();

    sketchViewModel.delete();
    const polygon = geometryEngine.simplify(new Polygon(geom));
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

    if (zoomTo && polygon && polygon.centroid) {
      setTimeout(() => {
        mapView.goTo(
          {
            target: [polygon.centroid],
          },
          { duration: 1000 }
        );
      }, 500);
    }

    setMode(DrawShapeMode.Complete);

    props.setGeometry(polygon);
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
    <button className="draw-shape__draw-button" onClick={onDrawButtonClick}>
      <DrawIcon />
      <span>{buttonTitle}</span>
    </button>
  );
};

export default LocationMapDrawer;
