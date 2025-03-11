import React, { useState, useCallback } from 'react';
import Modal from '@material-ui/core/Modal';
import Button from 'common/js/components/Button';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DragDropFile from './DragDropFile';
import UploadProcess from './UploadProcess';
import createMultiGridHeaders from '../../../edit/table/createMultiGridHeaders';
import editLocationsFromCsv from '../../../../../../common/js/service/editLocationsFromCsv.service';
import { downloadingSelectedLocations } from '../../../../../../common/js/service/downloadingSelectedLocations.service';
import { locationsPage } from '../../../../../../common/js/config';
import { isDownloadDisabledForThisList } from '../../../../../../locations/js/utils/lists.utils';
import { notEditableFields } from './LargeListEditing.constants';
import { defaultCustomAttributeHeaders } from '../../../edit/table/MultiGridTable.config';
import './LargeListEditing.scss';

function LargeListEditing({
  addType,
  activeTemplate,
  commodityType,
  templateData,
  customAttributeNames,
  listID,
  listName,
  filters,
  tableSortedBy,
  tableSortedDesc,
  onClose,
  isLoading,
}) {
  const [fileInfo, setFileInfo] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [processCompleted, setProcessCompleted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const donwloadHandler = () => {
    isLoading(true);
    const isListExcluded = isDownloadDisabledForThisList(listID);

    let customAttributeHeaders = defaultCustomAttributeHeaders;
    if (customAttributeNames.length) {
      customAttributeHeaders = customAttributeNames.map((custom, i) => ({
        field: `Attribute${i + 1}`,
        custom,
      }));
    }

    const multiGridHeaders = createMultiGridHeaders(
      addType,
      activeTemplate,
      commodityType,
      customAttributeHeaders,
      templateData,
      isListExcluded
    );

    const editableFields = multiGridHeaders
      .filter((field) => !notEditableFields.includes(field))
      .toString();

    downloadingSelectedLocations(listID, listName, {
      orderType: tableSortedDesc ? 'desc' : 'asc',
      sortByAttribute: tableSortedBy,
      selectedCountry: filters?.selectedCountry || '',
      selectedState: filters?.selectedState || '',
      selectedSubState: filters?.selectedSubState || '',
      selectedAreaMax: filters?.selectedAreaMax || 0,
      selectedAreaMin: filters?.selectedAreaMin || null,
      columnsToReturn: editableFields,
    }).then(() => {
      isLoading(false);
    });
  };

  const onCloseHandler = () => {
    onClose(processCompleted && success);
  };

  const updateLocations = () => {
    isLoading(true);

    editLocationsFromCsv(listID, csvData, activeTemplate)
      .then(({ data }) => {
        const { success: editSuccess, message } = data;
        setProcessCompleted(true);
        isLoading(false);
        setSuccess(editSuccess);
        setErrorMessage(message);
      })
      .catch((err) => {
        console.error(err);
        setProcessCompleted(true);
        isLoading(false);
        setSuccess(false);
        if (err?.response?.data?.message) {
          setErrorMessage(err.response.data.message);
        }
      });
  };

  const uploadCompletedHandler = useCallback(
    (data, errors) => {
      if (errors.length) {
        setProcessCompleted(true);
        setSuccess(false);
        setErrorMessage(errors[0]?.message);
      } else {
        setCsvData(data);
      }
    },
    [setCsvData]
  );

  const title = `Edit ${listName} list`;

  const showDownload = !fileInfo;
  const showUploadProcess = !processCompleted && fileInfo;
  const showSuccessMessage = processCompleted && success;
  const showFailedMessage = processCompleted && !success;

  return (
    <Modal className="large-list-editing" open onClose={onCloseHandler}>
      <div className="large-list-editing__container">
        <div className="large-list-editing__title">{title}</div>
        {showDownload && (
          <>
            <div className="large-list-editing__download-section">
              <div className="large-list-editing__subtitle">
                {locationsPage.largeListEditing.downloadFileTitle}
              </div>
              <div className="large-list-editing__description">
                {locationsPage.largeListEditing.downloadFileInstructions}
              </div>
              <Button variant="primary" onClick={() => donwloadHandler()} label="Download" />
            </div>
            <DragDropFile handleFiles={(files) => setFileInfo(files)} />
          </>
        )}
        {showSuccessMessage && (
          <div className="large-list-editing__confirmation-message">
            <CheckCircleOutlineIcon style={{ color: 'rgba(151,189,61,0.25)', fontSize: '100px' }} />
            <div className="large-list-editing__subtitle">
              {locationsPage.largeListEditing.successTitle}
            </div>
            <div className="large-list-editing__description">
              {locationsPage.largeListEditing.successDescription}
            </div>
          </div>
        )}
        {showFailedMessage && (
          <div className="large-list-editing__confirmation-message">
            <ErrorOutlineIcon style={{ color: 'rgba(237,24,70,0.25)', fontSize: '100px' }} />
            <div className="large-list-editing__subtitle">
              {locationsPage.largeListEditing.errorTitle}
            </div>
            <div className="large-list-editing__description">
              {errorMessage || locationsPage.largeListEditing.errorDescription}
            </div>
          </div>
        )}
        {showUploadProcess && (
          <UploadProcess
            listID={listID}
            fileInfo={fileInfo}
            uploadCompletedHandler={uploadCompletedHandler}
          />
        )}

        <div className="large-list-editing__actions-container">
          <Button
            onClick={onCloseHandler}
            label={
              processCompleted
                ? locationsPage.largeListEditing.close
                : locationsPage.largeListEditing.cancel
            }
          />
          {showUploadProcess && (
            <Button
              variant="primary"
              onClick={() => updateLocations()}
              label={locationsPage.largeListEditing.update}
              disabled={!csvData}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default LargeListEditing;
