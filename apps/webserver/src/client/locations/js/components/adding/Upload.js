import { locationsPage, convertURL } from '../../../../common/js/config';
// import store from '../../../../locations/js/store';
import Point from 'esri/geometry/Point';
import Polygon from 'esri/geometry/Polygon';
import Deferred from 'dojo/Deferred';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';
import GeometryEngine from 'esri/geometry/geometryEngine';
import FileDrop from '../uploading/FileDrop';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import { discernProjection, maxLocations, maxFileSizeMB } from '../../utils/upload.utils';
import Papa from 'papaparse';
import ExcelParse from 'xlsx';
import React, { Component } from 'react';
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';
import SpatialReference from 'esri/geometry/SpatialReference';
import { parseKMZAndKMLFile } from '../uploading/UploadLocations.util';
export default class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploading: false,
      windBarriers: '',
      riparian: '',
      bufferZones: '',
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      inputKey: 0,
    };
    require(['esri/geometry/projection'], (projection) => {
      projection.load().then(() => {
        this.projection = projection;
      });
    });
  }

  geocodeMill = (mill) => {
    console.log('millll', mill);
    const deferred = new Deferred();
    const queryTask = new QueryTask(locationsPage.updatedPalmOilMillUrl);

    const query = new Query();

    query.where = "id = '" + mill.ID + "'";
    query.returnGeometry = true;
    query.outFields = [];
    queryTask.execute(query).then((result) => {
      if (result.features && result.features.length > 0) {
        deferred.resolve(result.features[0]);
      } else {
        deferred.resolve(false);
      }
    });

    return deferred;
  };

  parseZip = (file) => {
    discernProjection(file).then(
      (projDefs) => {
        if (!projDefs[0]) {
          const formData = new FormData();
          formData.append('file', file);
          const xmlhttp = new XMLHttpRequest();
          xmlhttp.open('POST', convertURL);
          xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
              const response = JSON.parse(xmlhttp.responseText);
              let geom;
              const data = response.data;
              const oldSpatialRef = new SpatialReference(projDefs[1]);
              const newSpatialRef = new SpatialReference(4326);
              if (
                data &&
                data.attributes &&
                data.attributes.features &&
                data.attributes.features.length > 0
              ) {
                const feat = data.attributes.features[0];
                if (
                  feat.geometry &&
                  feat.geometry.coordinates &&
                  feat.geometry.coordinates.length &&
                  feat.geometry.coordinates[0].constructor === Array
                ) {
                  const esriJson = geojsonUtil.geojsonToArcGIS(feat.geometry);
                  const oldFeatGeometry = new Polygon({
                    rings: esriJson.rings,
                    spatialReference:
                      esriJson.spatialReference.wkid === newSpatialRef.wkid
                        ? esriJson.spatialReference
                        : oldSpatialRef,
                  });
                  geom = this.projection.project(oldFeatGeometry, newSpatialRef);
                } else if (
                  feat.geometry &&
                  feat.geometry.coordinates &&
                  feat.geometry.coordinates.length &&
                  typeof feat.geometry.coordinates[0] === 'number'
                ) {
                  const centerPoint = {
                    type: 'point',
                    x: feat.geometry.coordinates[0],
                    y: feat.geometry.coordinates[1],
                    spatialReference: oldSpatialRef,
                  };
                  const projectedCenterPoint = this.projection.project(centerPoint, newSpatialRef);
                  //buffer the point into a poly based off of Analysis_R/Analysis_A and setGeometry of that poly!
                  if (feat.properties.Analysis_R) {
                    geom = GeometryEngine.geodesicBuffer(
                      projectedCenterPoint,
                      parseFloat(feat.properties.Analysis_R),
                      'kilometers'
                    );
                  } else if (feat.properties.Analysis_A) {
                    const kilosSquared = feat.properties.Analysis_A / 100;
                    const kilos = Math.sqrt(kilosSquared / Math.PI);
                    //this line never gets hit
                    geom = GeometryEngine.geodesicBuffer(
                      this.state.originalGeometry,
                      kilos.toFixed(2),
                      'kilometers'
                    );
                  } else {
                    geom = GeometryEngine.geodesicBuffer(projectedCenterPoint, 4, 'kilometers'); //Medium Buffer
                  }
                }

                this.props.setGeometry(geom);
                this.setState({ isUploading: false });
                ga(
                  'send',
                  'event',
                  'Locations File Upload',
                  'add location upload file',
                  'user uploaded a zip file'
                );
              }
            } else if (xmlhttp.readyState === 4) {
              console.log('Error: shapefile not working');
            }
          };
          xmlhttp.send(formData);
        } else {
          this.setState({
            isUploading: false,
            dialogOpen: true,
            dialogTitle: locationsPage.upload.errors.dataProjection,
            dialogMessage: projDefs[0],
          });
          ga(
            'send',
            'event',
            'Locations File Upload error',
            'add location upload projection error',
            'user uploaded a shapefile in the wrong projection'
          );
        }
      },
      function (ex) {
        this.setState({
          dialogOpen: true,
          dialogTitle: locationsPage.upload.errors.dataRead,
          dialogMessage: ex,
          isUploading: false,
        });
        ga(
          'send',
          'event',
          'Locations File Upload error',
          'add location upload data read error',
          'user uploaded a shapefile that could not be read'
        );
      }
    );
  };

  parseXlsx = (f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = !e ? reader.content : e.target.result;
      const workbook = ExcelParse.read(data, { type: 'binary' });
      const jsonVar = ExcelParse.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      const feature = jsonVar[0];

      if (this.props.activeTemplate === 'palmMill' || (feature.ID && !feature.Latitude)) {
        this.geocodeMill(feature).then((feat) => {
          if (feat) {
            let point;
            if (feat.properties.Analysis_R) {
              point = GeometryEngine.geodesicBuffer(
                feat.geometry,
                parseFloat(feat.properties.Analysis_R),
                'kilometers'
              );
            } else {
              const kilosSquared = feat.properties.Analysis_A / 100;
              const kilos = Math.sqrt(kilosSquared / Math.PI);
              point = GeometryEngine.geodesicBuffer(feat.geometry, kilos.toFixed(2), 'kilometers');
            }
            this.props.setGeometry(geom);
            this.setState({
              isUploading: false,
            });
            ga(
              'send',
              'event',
              'Locations File Upload',
              'add location upload file',
              'user uploaded an xls file'
            );
          } else {
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Incorrect Mill ID',
              dialogMessage:
                'The ID column that you provided does not match any known mill, please upload a valid "wri_id".',
            });
          }
        });
      } else {
        const point = new Point({
          latitude: parseInt(feature.Latitude),
          longitude: parseInt(feature.Longitude),
          spatialReference: { wkid: 4326 },
        });

        let geom;
        if (feature['Analysis Radius']) {
          geom = GeometryEngine.geodesicBuffer(
            point,
            parseFloat(feature['Analysis Radius']),
            'kilometers'
          );
        } else if (feature['Analysis Area']) {
          const kilosSquared = feature['Analysis Area'] / 100;
          const kilos = Math.sqrt(kilosSquared / Math.PI);
          geom = GeometryEngine.geodesicBuffer(point, kilos.toFixed(2), 'kilometers');
        } else {
          console.warn('missing both radius and area, which is not allowed');
          geom = GeometryEngine.geodesicBuffer(point, 2, 'kilometers');
        }

        if (!geom) {
          this.setState({
            isUploading: false,
            dialogOpen: true,
            dialogTitle: locationsPage.upload.errors.excelTitle,
            dialogMessage: locationsPage.upload.errors.excelMessage,
          });
          return;
        }

        this.props.setGeometry(geom);
        this.setState({
          isUploading: false,
        });
        ga(
          'send',
          'event',
          'Locations File Upload',
          'add location upload file',
          'user uploaded an xls file'
        );
      }
    };
    reader.onerror = (err) => {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Excel parsing error',
        dialogMessage: 'The Excel file was parsed incorrectly, please upload a valid file.',
      });
      console.log(`Error: ${err}`);
    };
    reader.readAsBinaryString(f);
  };

  handleKMZandKML = (file) => {
    parseKMZAndKMLFile(file)
      .then((geometry) => {
        this.props.setGeometry(geometry);
        this.setState({ isUploading: false });
        ga(
          'send',
          'event',
          'Locations File Upload',
          'add location upload file',
          'user uploaded an kmz/kml file'
        );
      })
      .catch((e) => console.error('Failed to parse KMZ/KML file', e));
  };

  complete = (results) => {
    if (results.data && results.data.length && results.data.length > 0) {
      const feature = results.data[0];

      if (this.props.activeTemplate === 'palmMill' || (feature.ID && !feature.Latitude)) {
        this.geocodeMill(feature).then((feat) => {
          if (feat) {
            this.props.setGeometry(feat.geometry);
            this.setState({
              isUploading: false,
            });
            ga(
              'send',
              'event',
              'Locations File Upload',
              'add location upload file',
              'user uploaded a csv file'
            );
          } else {
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Incorrect Mill ID',
              dialogMessage:
                'The ID column that you provided does not match any known mill, please upload a valid "wri_id".',
            });
          }
        });
      } else {
        const geom = new Point({
          latitude: parseInt(feature.Latitude),
          longitude: parseInt(feature.Longitude),
        });

        this.props.setGeometry(geom);
        this.setState({
          isUploading: false,
        });
        ga(
          'send',
          'event',
          'Locations File Upload',
          'add location upload file',
          'user uploaded a csv file'
        );
      }
    }
  };

  error = (error, newFile) => {
    console.log('Parsing Error:', error, newFile);
    this.setState({
      dialogOpen: true,
      dialogTitle: 'CSV parsing error',
      dialogMessage: 'The csv file was parsed incorrectly, please upload a valid file.',
    });
  };

  prevent = (evt) => {
    evt.preventDefault();
    return false;
  };

  fileUpload = (file) => {
    if (!file) {
      return;
    }

    this.setState({
      dialogOpen: false,
      dndActive: false,
      isUploading: true,
      fileName: file.name,
      inputKey: this.state.inputKey + 1,
    });

    const inputFile = file;
    const config = {
      delimiter: '', // auto-detect
      newline: '', // auto-detect
      header: true,
      dynamicTyping: true,
      preview: 0,
      encoding: '',
      worker: false,
      comments: false,
      complete: this.complete,
      error: this.error,
      download: false,
      skipEmptyLines: false,
    };

    // Handle parsing for different formats
    const fileExtension = inputFile.name.slice(inputFile.name.lastIndexOf('.') + 1);
    switch (fileExtension) {
      case 'csv':
        Papa.parse(inputFile, config);
        break;
      case 'zip':
        this.parseZip(inputFile);
        break;
      case 'xlsx':
        this.parseXlsx(inputFile);
        break;
      case 'kml':
      case 'kmz':
        this.handleKMZandKML(inputFile);
        break;
      default:
        console.log(
          `File extension ${inputFile.name.slice(-3)} is not supported. (csv, xlx, zip, kml, kmz)`
        );
        this.setState({
          dialogOpen: true,
          dialogTitle: locationsPage.add.errors.fileExtensionNotSupported.title,
          dialogMessage: locationsPage.add.errors.fileExtensionNotSupported.message,
          isUploading: false,
        });
    }
  };

  premiumFileUpload = (file) => {
    if (!file) {
      return;
    }
  };

  render() {
    const { country, state, substate } = this.props;
    const { dialogOpen, dialogTitle, dialogMessage, inputKey, isUploading } = this.state;

    const locationString =
      substate && state
        ? [substate, state, country].join(', ')
        : state
        ? [state, country].join(', ')
        : country;

    return (
      <div className="locations-add-subpage">
        <div className="locations-add-subpage__content">
          <div className="flex-grid locations-upload-step upload-form">
            <FileDrop
              inputKey={inputKey}
              isUploading={isUploading}
              onFileUpload={this.fileUpload}
            />
            <div className="instructions-container flex-grid-column justify-center">
              <p>
                {locationsPage.upload.maximumLocations} {numberWithCommas(maxLocations)}
              </p>
              <p>
                {locationsPage.upload.maximumFilesize} {maxFileSizeMB}MB
              </p>
              <p className="light">{locationsPage.upload.filetypes.title}</p>
              <ul>
                <li>{locationsPage.upload.filetypes.csv}</li>
                <li>{locationsPage.upload.filetypes.zip}</li>
                <li>{locationsPage.upload.filetypes.kml}</li>
              </ul>
            </div>
          </div>
          {locationString && !dialogOpen && (
            <div className="upload-form__location-text">
              <span>{locationsPage.add.locationLabel}</span>
              <span className="upload-form__location-info">{locationString}</span>
            </div>
          )}
          {dialogOpen && (
            <div>
              <p>
                <strong>{dialogTitle}</strong>
              </p>
              <p>{dialogMessage}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
