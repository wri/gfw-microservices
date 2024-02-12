import React, { Component } from 'react';
import Point from '@arcgis/core/geometry/Point';
import Papa from 'papaparse';
import FileDrop from '../uploading/FileDrop';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import { maxLocations, maxFileSizeMB } from '../../utils/upload.utils';
import { geocodeMill } from './geocodeMill';
import { parseZip } from './parseZip';
import { parseXlsx } from './parseXlsx';
import { locationsPage } from '../../../../common/js/config';
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
  }

  complete = (results) => {
    if (results.data && results.data.length && results.data.length > 0) {
      const feature = results.data[0];

      if (this.props.activeTemplate === 'palmMill' || (feature.ID && !feature.Latitude)) {
        geocodeMill(feature).then((feat) => {
          if (feat) {
            this.props.setGeometry(feat.geometry);
            this.setState({
              isUploading: false,
            });
            gtag('event', 'add location upload file', {
              event_category: 'Locations File Upload',
              event_label: 'user uploaded a csv file',
            });
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
        gtag('event', 'add location upload file', {
          event_category: 'Locations File Upload',
          event_label: 'user uploaded a csv file',
        });
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
        parseZip(file, this.state.stateOriginalGeometry).then((result) => {
          if (result.geom) {
            this.props.setGeometry(result.geom);
          }
          this.setState(result);
          if (!result.dialogOpen) {
            gtag('event', 'add location upload file', {
              event_category: 'Locations File Upload',
              event_label: 'user uploaded a zip file',
            });
          }
        });

        break;
      case 'xlsx':
        parseXlsx(inputFile, this.props.activeTemplate)
          .then(({ geometry, isUploading }) => {
            this.props.setGeometry(geometry);
            this.setState({ isUploading });
            gtag('event', 'add location upload file', {
              event_category: 'Locations File Upload',
              event_label: 'user uploaded an xls file',
            });
          })
          .catch((error) => {
            this.setState(error);
          });
        break;
      case 'kml':
      case 'kmz':
        parseKMZAndKMLFile(file)
          .then((geometry) => {
            this.props.setGeometry(geometry);
            this.setState({ isUploading: false });
            gtag('event', 'add location upload file', {
              event_category: 'Locations File Upload',
              event_label: 'user uploaded an kmz/kml file',
            });
          })
          .catch((error) => {
            console.error('Failed to parse KMZ/KML file', error);
          });
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
