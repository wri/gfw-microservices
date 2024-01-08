import React, { Component } from 'react';
import EsriMap from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import MapView from '@arcgis/core/views/MapView';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import { locationsPage } from '../../../../common/js/config';
import Button from '../../../../common/js/components/Button';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import './DrawShape.scss';

const containerStyle = {
  display: 'block',
  height: '490px',
  backgroundColor: '#222327',
};
const mapStyle = {
  width: '100%',
  height: '100%',
};

const DrawShapeMode = {
  Inactive: 'inactive',
  Drawing: 'drawing',
  Complete: 'complete',
};

export default class DrawShape extends Component {
  sketchViewModel;
  sketchCreateListener;

  constructor(props) {
    super(props);
    this.state = {
      geometry: undefined,
      mode: DrawShapeMode.Inactive,
    };
  }

  componentDidMount() {
    this.initMap();
  }

  componentWillUnmount() {
    if (this.sketchCreateListener) {
      this.sketchCreateListener.remove();
    }
    if (this.sketchViewModel) {
      this.sketchViewModel.destroy();
    }
    if (this.mapView) {
      this.mapView.destroy();
    }
  }

  initMap = () => {
    const { geomFromMap } = this.props;
    new MapView({
      container: this.refs.mapView,
      center: [0, 16.53],
      zoom: 3,
      map: new EsriMap({
        basemap: 'hybrid',
      }),
    }).when((mapView) => {
      this.mapView = mapView;

      // Initialize Draw Tool
      this.sketchViewModel = new SketchViewModel({
        view: this.mapView,
        layer: this.mapView.graphics,
        polygonSymbol: {
          type: 'simple-fill',
          color: [0, 0, 0, 0.65],
          outline: {
            color: [0, 0, 0, 1],
            width: 1,
          },
        },
      });

      if (geomFromMap) {
        this.setDrawPoly(geomFromMap, true);
      }

      this.sketchCreateListener = this.sketchViewModel.on('create', ({ graphic, state }) => {
        if (state === 'complete') {
          this.setDrawPoly(graphic.geometry);
        }
      });
    });
  };

  onDrawButtonClick = () => {
    const { mode } = this.state;
    if (mode === DrawShapeMode.Inactive) {
      // Currently no drawing -> Begin the draw workflow
      this.sketchViewModel.create('polygon');
      this.setState({ mode: DrawShapeMode.Drawing });
    } else if (mode === DrawShapeMode.Drawing) {
      // Currently drawing -> Cancel the draw workflow
      this.sketchViewModel.cancel();
      this.setState({ mode: DrawShapeMode.Inactive });
    } else if (mode === DrawShapeMode.Complete) {
      // Drawing finished and submitted -> Start a new drawing
      this.mapView.graphics.removeAll();
      this.sketchViewModel.delete();
      this.sketchViewModel.create('polygon');
      this.setState({ geometry: undefined, mode: DrawShapeMode.Drawing });
    } else {
      console.warn(`No defined action for MODE ${mode}`);
    }
  };

  setDrawPoly = (geom, zoomTo = false) => {
    this.mapView.graphics.removeAll();
    this.sketchViewModel.delete();

    // create a new polygon with the passed geometry to preserve the spatial reference
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
    this.mapView.graphics.add(polygonGraphic);

    const mv = this.mapView;
    if (zoomTo && polygon && polygon.centroid) {
      setTimeout(function () {
        mv.goTo(
          {
            target: [polygon.centroid],
          },
          { duration: 1000 }
        );
      }, 500);
    }

    this.setState({ geometry: polygon, mode: DrawShapeMode.Complete });
    this.props.setGeometry(polygon);
    gtag('event', 'add location map draw', {
      event_category: 'Locations Draw',
      event_label: 'user drew a polygon on the Add Location map',
    });
  };

  render() {
    const { geometry, mode } = this.state;

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
        userMessage = `Area: ${numberWithCommas(
          parseInt(areaKm.toFixed(0))
        )} km (${numberWithCommas(parseInt(areaHa.toFixed(0)))} ha)`;
        break;
      }
      default:
        userMessage = '';
    }

    return (
      <div className="draw_shape">
        <div className={'draw_shape__message'}>{userMessage}</div>
        <div style={containerStyle} className="draw_shape__map-container">
          <Button
            className="draw_shape__draw-button"
            onClick={this.onDrawButtonClick}
            label={buttonTitle}
          />
          <div style={mapStyle} ref="mapView"></div>
        </div>
      </div>
    );
  }
}
