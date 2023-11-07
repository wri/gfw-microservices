/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-case-declarations */
import React, { useState, useRef } from 'react';
import Dialog from 'material-ui/Dialog';
import LocationOn from '@mui/icons-material/LocationOn';
import TableChart from '@mui/icons-material/TableChart';
import TableView from '@mui/icons-material/TableView';
import PendingTwoToneIcon from '@mui/icons-material/PendingTwoTone';
import DriveFolderUploadTwoToneIcon from '@mui/icons-material/DriveFolderUploadTwoTone';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { locationsPage } from '../../../../common/js/config';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import IconButton from '../../../../common/js/components/IconButton';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import { containsPunctuation } from '../../utils/lists.utils';
import uploadProcess from './uploadProcess';
import { formatBytes } from '../../utils/upload.utils';
import CircularProgressWithLabel from './CircularProgressWithLabel';
import ExistingListSelector from './ExistingListSelector';
import { deduceActiveId } from '../../../../common/js/utils/templateUtils';
import { analysisTypes } from '../../../../../config/env/analysisTypes.constants';
import featureFlags from '../../../../../utils/general.utils';
import getAnalysesSelectedByDefault from '../../../../../utils/getAnalysesSelectedByDefault';
import AnalysisTypesSelector from '../../../../common/js/components/AnalysisTypesSelector';

export const CHOICES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  LARGE_LIST: 'largelist',
};

const iconStyle = { color: 'black' };

function AddLocationChooser({ onCancel, onChoice, userLists }) {
  const [choice, setChoice] = useState(undefined);
  const [isLargeListUpload, setIsLargeListUpload] = useState(false);
  const [llpStep1, setLlpStep1] = useState(false);
  const [llpStep2, setLlpStep2] = useState(false);
  const [llpStep3, setLlpStep3] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [largeListFile, setLargeListFile] = useState(undefined);
  const [stringDate, setStringDate] = useState('');
  const [fileBytesUploaded, setFileBytesUploaded] = useState('');
  const [uploadedPercentaje, setUploadedPercentaje] = useState(0);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [listName, setListName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [existingListName, setExistingListName] = useState();
  const [selectedAnalysis, setSelectedAnalysis] = useState([]);
  const fileInputRef = useRef(null);

  const chooser = locationsPage.landing.addLocationChooser;

  const handleUploadFileClick = () => {
    fileInputRef.current.click();
  };

  const shouldCloseDialog = () => {
    setDialogOpen(false);
  };

  function calculatePercentaje(loaded, total) {
    return Math.round(loaded / total) * 100;
  }

  function uploadFileToS3(file, url, contentType) {
    const xhr = new XMLHttpRequest();
    return new Promise((resolve) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          setUploadedPercentaje(calculatePercentaje(event.loaded, event.total));
          setFileBytesUploaded(formatBytes(event.loaded));
        }
      });
      xhr.addEventListener('loadend', () => {
        resolve(xhr.readyState === 4 && xhr.status === 200);
      });

      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', contentType);
      xhr.send(file);
    });
  }

  function createUploadProcess() {
    const nameOfListToUploadLocationsTo = existingListName || { listName };
    const isExistingList = !!existingListName;

    if (!isExistingList) {
      const nameContainsPunctuation = containsPunctuation(listName.toLowerCase());
      if (nameContainsPunctuation) {
        setDialogTitle('Invalid List Name');
        setDialogMessage(
          'The list name chosen contains punctuation. Please choose a list name with only letters, numbers, and/or spaces.'
        );
        setDialogOpen(true);
        return;
      }

      const checkListExists = userLists.find(
        (list) => list.list_name.toLowerCase() === listName.toLowerCase()
      );
      if (checkListExists) {
        setDialogTitle('List not created');
        setDialogMessage(
          'A list already exists with this name. Enter a new list name and click Continue button.'
        );
        setDialogOpen(true);
        return;
      }
    }

    setIsSaving(true);

    uploadProcess(
      nameOfListToUploadLocationsTo,
      uploadFileToS3,
      largeListFile,
      isExistingList,
      selectedAnalysis
    )
      .then(() => {
        if (selectedAnalysis.includes(analysisTypes.DEFORESTATION_KPIS)) {
          gtag('event', 'User uploads a list with Deforestation Reporting KPIs analysis selected', {
            event_category: 'Deforestation Reporting KPIs',
          });
        }
        setDialogTitle('Locations Added');
        const action = isExistingList ? 'appended' : 'created';
        setDialogMessage(
          `You have successfully ${action} locations to list ${nameOfListToUploadLocationsTo.listName}.`
        );
        setLlpStep2(false);
        setLlpStep3(true);
      })
      .catch(() => {
        setDialogTitle('Error');
        setDialogMessage('This list was not able to be added. Please review and try again.');
      })
      .finally(() => {
        setIsSaving(false);
        setDialogOpen(true);
      });
  }

  const _onFileUpload = (event) => {
    event.preventDefault();

    const file =
      (event.target && event.target.files && event.target.files[0]) ||
      (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]);

    const fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
    switch (fileExtension) {
      case 'csv':
      case 'zip':
      case 'xlsx':
      case 'kml':
      case 'kmz':
        setLlpStep1(false);
        setLlpStep2(true);
        setLargeListFile(file);
        const dateObject = new Date();
        const formatDate = dateObject.toLocaleDateString('en-us', {
          weekday: undefined,
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        const formatHour = `${dateObject.getHours()}:${dateObject.getMinutes()}`;
        setStringDate(`${formatDate} at ${formatHour}`);
        setFileBytesUploaded(formatBytes(0));
        break;
      default:
        setDialogTitle(locationsPage.add.errors.fileExtensionNotSupported.title);
        setDialogMessage(locationsPage.add.errors.fileExtensionNotSupported.message);
        setDialogOpen(true);
        setLargeListFile(undefined);
    }
  };

  const _onEnter = (event) => {
    event.preventDefault();
  };

  const _onLeave = (event) => {
    event.preventDefault();
  };

  function alertPremiumFeature() {
    setDialogTitle('Upload Large List trial now available');
    setDialogMessage(
      'Please contact <a href="mailto:gfwprosupport@wri.org" style="color:#97bd3d;">gfwprosupport@wri.org</a> for access to trial this new feature.'
    );
    setDialogOpen(true);
  }

  return (
    <div className="dialog add-location-chooser">
      <div className="dialog__header add-location-chooser__header">
        <h1 className="dialog__title">{chooser.title}</h1>
        <IconButton
          icon={<IconTimes />}
          onClick={() => {
            if (llpStep3 && isLargeListUpload) {
              setIsSaving(true); // display loader
              window.location.href = '/locations'; // refresh locations page after submitting a Large List
            } else {
              onCancel();
            }
          }}
          size="large"
        />
      </div>

      {!isLargeListUpload && (
        <div className="add-location-chooser__content dialog__content">
          <div
            id={chooser.single.id}
            className={`selection-card ${
              choice === CHOICES.SINGLE ? 'selection-card--selected' : ''
            }`}
            onClick={() => setChoice(CHOICES.SINGLE)}
          >
            <div className="selection-card__icon-container">
              <LocationOn style={iconStyle} />
            </div>
            <h3 className="selection-card__title">{chooser.single.header}</h3>
            <p className="selection-card__body">{chooser.single.text}</p>
          </div>

          <div
            id={chooser.multiple.id}
            className={`selection-card ${
              choice === CHOICES.MULTIPLE ? 'selection-card--selected' : ''
            }`}
            onClick={() => setChoice(CHOICES.MULTIPLE)}
          >
            <div className="selection-card__icon-container">
              <TableChart style={iconStyle} />
            </div>
            <h3 className="selection-card__title">{chooser.multiple.header}</h3>
            <p className="selection-card__body">{chooser.multiple.text}</p>
          </div>

          <div
            id={chooser.large_list.id}
            className={`selection-card ${
              choice === CHOICES.LARGE_LIST ? 'selection-card--selected' : ''
            }`}
            onClick={() => {
              if (subscription_status_id === 2) {
                setIsLargeListUpload(true);
                setLlpStep1(true);
                setChoice(undefined);
              } else {
                alertPremiumFeature();
              }
            }}
          >
            <div className="selection-card__icon-container">
              <TableView style={iconStyle} />
            </div>
            <h3 className="selection-card__title">{chooser.large_list.header}</h3>
            <p className="selection-card__body">{chooser.large_list.text}</p>
          </div>
        </div>
      )}

      {isLargeListUpload && llpStep1 && (
        <div
          className="add-location-chooser__filedrop_container"
          onDragEnter={_onEnter}
          onDragLeave={_onLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={_onFileUpload}
          onClick={handleUploadFileClick}
        >
          <div className="add-location-chooser__filedrop_text">
            <input
              id="file-input"
              type="file"
              name="file"
              onChange={_onFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <DriveFolderUploadTwoToneIcon
              size={256}
              style={{ color: '#ffdbb2', width: '4em', height: '4em' }}
            />
            <h2 className="gfw-lists__title">DROP YOUR FILES HERE OR CLICK TO UPLOAD</h2>
            <div className="add-location-chooser__filedrop_description">
              <b>Accepted file types</b>
              <ul>
                <li>CSV or Excel File</li>
                <li>Zip file containing a shapefile (SHP, DBF, SHX, and PRJ)</li>
                <li>KLM or KMZ</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {isLargeListUpload && llpStep2 && (
        <div className="upload-step-1">
          <section className="add-location-chooser__general-section add-location-chooser__upload_progress">
            <FolderZipIcon
              className="zip-icon"
              style={{ color: '#1ABCFE', width: '24px', height: '24px' }}
            />
            <div className="upload-process-label">Upload process</div>
            <div className="upload-process-filename">{largeListFile ? largeListFile.name : ''}</div>
            <div className="upload-process-progress">
              {stringDate} • {fileBytesUploaded} /{' '}
              {formatBytes(largeListFile ? largeListFile.size : 0)}
            </div>
            <CircularProgressWithLabel value={uploadedPercentaje} />
          </section>
          <hr className="section-divisor" />
          <section
            className="add-location-chooser__general-section"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ width: '45%' }}>
              <div className="label">
                List name: <span>*</span>
              </div>
              <input
                className="full-input"
                placeholder="List name"
                style={{ height: '40px', margin: '9px' }}
                disabled={existingListName}
                onChange={(evt) => {
                  setListName(evt.target.value);
                }}
              />
            </div>
            <div style={{ width: '5%', textAlign: 'center' }}> or </div>
            <div style={{ width: '45%' }}>
              <ExistingListSelector
                templateId={deduceActiveId('cocoaGeneric')}
                existingListSelectionHandler={setExistingListName}
              />
            </div>
          </section>
          <hr className="section-divisor" />
          <section className="add-location-chooser__general-section">
            <div className="label">
              Type: <span>*</span>
            </div>
            <div className="content-type">
              <div className="content-type-title">Commodity</div>
              <div className="content-type-description">
                Multiple locations upload upload available for Cocoa Generic only.
              </div>
            </div>
          </section>

          {featureFlags.isAfiAvailable && (
            <AnalysisTypesSelector
              selectedAnalyses={selectedAnalysis}
              setSelectedAnalyses={setSelectedAnalysis}
            />
          )}
          {/* Temporary removed: GPV-1233
          <hr className="section-divisor" />
          <section className="add-location-chooser__general-section">
            <div className="label">Additional attributes:</div>
            <div className="flex-container">
              <input className="flex-input" placeholder="Attribute 1" />
              <input className="flex-input" placeholder="Attribute 2" />
              <input className="flex-input" placeholder="Attribute 3" />
            </div>
            </section> */}
          <hr className="section-divisor" />
        </div>
      )}

      {isLargeListUpload && llpStep3 && (
        <div className="add-location-chooser__filedrop_process_end">
          <div>
            <PendingTwoToneIcon
              size={256}
              style={{ color: '#baeaff', width: '4em', height: '4em' }}
            />
            <h2 className="gfw-lists__title">Now it is up to us!</h2>
            <p>You will soon receive an email notification that your list has begun processing</p>
          </div>
        </div>
      )}

      {choice && (
        <div className="dialog__footer add-location-chooser__footer">
          <Button
            className="dialog__primary-action"
            label={locationsPage.add.continue}
            onClick={() => onChoice(choice)}
            variant="primary"
            disabled={typeof choice === 'undefined'}
          />
          <LinkButton label={locationsPage.add.cancel} onClick={() => onCancel()} />
        </div>
      )}

      {isLargeListUpload && llpStep2 && (
        <div className="dialog__footer add-location-chooser__footer" style={{ right: '0' }}>
          <Button
            className="dialog__primary-action"
            disabled={(!listName && !existingListName) || selectedAnalysis.length <= 0}
            label={locationsPage.add.submit}
            onClick={() => createUploadProcess()}
            variant="primary"
          />
          <LinkButton label={locationsPage.add.cancel} onClick={() => onCancel()} />
        </div>
      )}

      <Dialog
        paperClassName="dialog-paper"
        open={dialogOpen}
        title={dialogTitle}
        actions={[
          <Button
            className="dialog__primary-action"
            variant="primary"
            label="OK"
            onClick={shouldCloseDialog}
          />,
        ]}
        onRequestClose={shouldCloseDialog}
      >
        <div dangerouslySetInnerHTML={{ __html: dialogMessage }} />
      </Dialog>
      <ModalLoader open={isSaving} />
    </div>
  );
}

export default AddLocationChooser;
