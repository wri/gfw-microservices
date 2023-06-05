import React, { useState, useRef } from 'react';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { locationsPage } from '../../../../../../common/js/config';
import './DragDropFile.scss';

const validFileTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel'];

function DragDropFile({ handleFiles }) {
  const [dragActive, setDragActive] = useState(false);
  const [isWrongFormat, setIsWrongFormat] = useState(false);
  const inputRef = useRef(null);

  // handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const isCsvFile = (file) => {
    if (file.name.split('.').pop() !== 'csv') {
      console.error(`wrong file extension: ${file.name.split('.').pop()}`);
      return false;
    }
    if (!validFileTypes.includes(file.type)) {
      console.error(`wrong file type: ${file.type}`);
      return false;
    }
    return true;
  };

  const handleFileSelected = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setIsWrongFormat(false);
    let file = null;
    if (e.dataTransfer?.files[0]) {
      // if file was dropped
      [file] = e.dataTransfer.files;
    } else if (e.target?.files[0]) {
      // if file was selected by clicking
      [file] = e.target.files;
    }
    if (file) {
      if (isCsvFile(file)) {
        handleFiles(file);
      } else {
        setIsWrongFormat(true);
      }
    }
  };

  return (
    <form className="drag-drop-file" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
      <label
        className={`drag-drop-file__label ${
          dragActive ? 'drag-drop-file__label--drag-active' : ''
        }`}
        htmlFor="input-file-upload"
      >
        <input
          id="input-file-upload"
          className="drag-drop-file__input"
          ref={inputRef}
          type="file"
          onChange={handleFileSelected}
          accept=".csv"
        />
        <div>
          <DriveFolderUploadIcon style={{ color: 'rgba(255,138,0,0.25)', fontSize: '100px' }} />
          <div className="large-list-editing__subtitle">
            {locationsPage.largeListEditing.dragAndDropTitle}
          </div>
          <p className="large-list-editing__description">
            {locationsPage.largeListEditing.dragAndDropInstructions}
          </p>
          {isWrongFormat && (
            <p className="large-list-editing__description large-list-editing__description--error">
              {locationsPage.largeListEditing.wrongFormatMessage}
            </p>
          )}
        </div>
      </label>
      {dragActive && (
        <div
          className="drag-drop-file__drag-file-element"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleFileSelected}
        />
      )}
    </form>
  );
}

export default DragDropFile;
