import React from 'react';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@mui/material/CardActions';
import { profilePage } from '../../../../../common/js/config';

function ConnectionAlreadyExistsMessage({ onCloseModal }) {
  return (
    <>
      <CardContent>
        <div className="new-b2b-connection-modal__response-title new-b2b-connection-modal__response-title--warning">
          {profilePage.profileManager.b2bSection.connectionAlreadyExists}
        </div>
        <div>{profilePage.profileManager.b2bSection.connectionAlreadyExistsDescription}</div>
      </CardContent>
      <CardActions style={{ justifyContent: 'right' }}>
        <button type="button" className="new-b2b-connection-modal__action-button" onClick={onCloseModal}>
          {profilePage.profileManager.b2bSection.cancel}
        </button>
      </CardActions>
    </>
  );
}

export default ConnectionAlreadyExistsMessage;
