import { locationsPage } from '../../../../common/js/config';
import React, { Component } from 'react';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';

const stylesheet = {
  visibility: 'hidden',
};

export default class FileDrop extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dndActive: false,
    };
  }

  render() {
    const { inputKey, isUploading } = this.props;
    return (
      <section className="uploading-files__container">
        <ModalLoader open={isUploading} />
        <div className="locations-upload-multiple notranslate">
          <label htmlFor="file-input" className="file-upload__button">
            {locationsPage.upload.browse}
            <input
              key={inputKey}
              style={stylesheet}
              id="file-input"
              type="file"
              name="file"
              onChange={this._onFileUpload}
              ref="fileInputBrowse"
            />
          </label>
        </div>
        <div className="locations-upload-multiple-divider">{locationsPage.upload.inputDivider}</div>
        <div className="locations-upload-multiple drag">
          <form
            className={`analysis-instructions ${this.state.dndActive ? 'active' : ''}`}
            encType="multipart/form-data"
            onDragEnter={this._onEnter}
            onDragLeave={this._onLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={this._onFileUpload}
            name="upload"
            ref="upload"
          >
            <span className="analysis-instructions-upload">{locationsPage.upload.uploadInstructions}</span>

            <input type="file" name="file" ref="fileInput" />
            <input type="hidden" name="publishParameters" value="{}" />
            <input type="hidden" name="filetype" value="shapefile" />
            <input type="hidden" name="f" value="json" />
          </form>
        </div>
      </section>
    );
  }

  _onFileUpload = (event) => {
    event.preventDefault();

    const file =
      (event.target && event.target.files && event.target.files[0]) ||
      (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]);
    console.log(file);

    /* const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/zip' },
      body: file
    };
    fetch('https://gfwpro-lpl-dev.s3.amazonaws.com/iizotfwl6zqilak-test.zip?AWSAccessKeyId=AKIAY7KBJ32RFTDIH3JD&Content-Type=application%2Fzip&Expires=1660869893&Signature=1VWWwfBrsoq%2Foh7KMT1Od%2FmkQjg%3D', requestOptions)
      .then(response => console.log(response)) */


    if (!file) {
      return;
    }

    this.props.onFileUpload(file);
  };

  _onEnter = (event) => {
    event.preventDefault();
    this.setState({ dndActive: true });
  };

  _onLeave = (event) => {
    event.preventDefault();
    this.setState({ dndActive: false });
  };
}
