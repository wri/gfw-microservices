import React, { useState, useEffect } from 'react';
import Graphic from '@arcgis/core/Graphic';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import { locationsPage } from '../../../../common/js/config';
import Button from '../../../../common/js/components/Button';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import featureFlags from '../../../../../utils/general.utils';
import DrawIcon from '@mui/icons-material/Draw';
import './LocationMapDrawer.scss';

const { isPolygonCoordinatesInputAvailable } = featureFlags;

const DrawShapeMode = {
  Inactive: 'inactive',
  Drawing: 'drawing',
  Complete: 'complete',
};

const LocationMapDrawer = (props) => {
  const { geomFromMap, mapView, sketchViewModel, setSketchViewModel } = props;
  const [geometry, setGeometry] = useState(undefined);
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
      if (state === 'complete') {
        setDrawPoly(mapView, sketchViewModelInstance, graphic.geometry);
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
      setGeometry(undefined);
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

    setGeometry(polygon);
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

  let userMessage;
  switch (mode) {
    case DrawShapeMode.Drawing:
      userMessage = locationsPage.add.draw.help;
      break;
    case DrawShapeMode.Complete: {
      const areaKm = geometry ? geometryEngine.geodesicArea(geometry, 'square-kilometers') : 0;
      const areaHa = geometry ? geometryEngine.geodesicArea(geometry, 'hectares') : 0;
      userMessage = `Area: ${numberWithCommas(parseInt(areaKm.toFixed(0)))} km (${numberWithCommas(
        parseInt(areaHa.toFixed(0))
      )} ha)`;
      break;
    }
    default:
      userMessage = '';
  }

  return (
    <>
      {!isPolygonCoordinatesInputAvailable && (
        <>
          <div className="location-map-drawer__message">{userMessage}</div>
          <Button
            className="location-map-drawer__draw-button"
            onClick={onDrawButtonClick}
            label={buttonTitle}
          />
        </>
      )}

      {isPolygonCoordinatesInputAvailable && (
        <button className="draw-shape__draw-button" onClick={onDrawButtonClick}>
          <DrawIcon />
          <span>{buttonTitle}</span>
        </button>
      )}
    </>
  );
};

export default LocationMapDrawer;
