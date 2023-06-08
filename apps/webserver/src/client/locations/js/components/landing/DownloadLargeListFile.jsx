import React from 'react';
import WarningTwoToneIcon from '@mui/icons-material/WarningTwoTone';
import RaisedButton from 'material-ui/RaisedButton';
import { locationsPage } from '../../../../common/js/config';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import IconButton from '../../../../common/js/components/IconButton';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';

function DownloadLarleListFile({ onCancel }) {
  const chooser = locationsPage.landing.addLocationChooser;

  return (
    <div className="dialog add-location-chooser">
      <div className="dialog__header">
        <h1 className="dialog__title">{chooser.title}</h1>
        <IconButton icon={<IconTimes />} onClick={() => onCancel()} size="large" />
      </div>

      <div className="add-location-chooser__filedrop_process_end">
        <div className="add-location-chooser__filedrop_text">
          <WarningTwoToneIcon
            size={256}
            style={{ color: '#F24E1E', width: '4em', height: '4em', opacity: '0.3' }}
          />
          <h2 className="gfw-lists__title">We found some errors in your file</h2>
          <p>
            There are data errors in your file. You can download it below, fix the errors and
            continue the upload process.
          </p>
          <RaisedButton
            style={{
              background: '#F24E1E',
              color: '#fff',
              paddingLeft: '30px',
              paddingRight: '30px',
              borderRadius: '50px',
            }}
            overlayStyle={{
              borderRadius: '18px',
              pointerEvents: 'none',
              backgroundColor: 'transparent',
              height: '100%',
            }}
            buttonStyle={{ background: 'transparent', color: '#fff' }}
            variant="primary"
          >
            DOWNLOAD FILE
          </RaisedButton>
        </div>
      </div>

      <ModalLoader open={false} />
    </div>
  );
}

export default DownloadLarleListFile;
