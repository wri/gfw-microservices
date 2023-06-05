import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Papa from 'papaparse';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import InlineLoader from '../../../../../../common/js/components/Loaders/InlineLoader';
import { formatBytes } from '../../../../utils/upload.utils';
import { locationsPage } from '../../../../../../common/js/config';
import './UploadProcess.scss';

function UploadProcess({ listID, fileInfo, uploadCompletedHandler }) {
  const [isLoading, setIsloading] = useState(true);

  useEffect(() => {
    const parseParams = {
      header: true,
      skipEmptyLines: true,
    };

    Papa.parse(fileInfo, {
      ...parseParams,
      complete({ data, errors }) {
        if (errors.length) {
          console.error(errors);
        }
        setIsloading(false);
        uploadCompletedHandler(data, errors);
      },
    });
  }, [listID, fileInfo, uploadCompletedHandler]);

  const { name, lastModifiedDate, size } = fileInfo;
  const fileName = name;
  const fileData = `${moment(lastModifiedDate).format('ddd D MMM YYYY h:mm:ss A')} • ${formatBytes(
    size
  )}`;
  return (
    <div className="upload-process">
      <div className="upload-process__subtitle">
        {locationsPage.largeListEditing.downloadProcessTitle}
      </div>
      <div className="upload-process__file-list">
        <div className="upload-process__file-detail">
          <FolderZipIcon style={{ color: '#1ABCFE', fontSize: '40px', marginRight: '15px' }} />
          <div>
            <div className="upload-process__file-name">{fileName}</div>
            <div className="upload-process__file-info">{fileData}</div>
          </div>
        </div>
        <div>{isLoading && <InlineLoader />}</div>
      </div>
      <div />
    </div>
  );
}
export default UploadProcess;
