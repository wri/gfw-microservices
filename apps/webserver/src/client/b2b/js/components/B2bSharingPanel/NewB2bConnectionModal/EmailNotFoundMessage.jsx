import React from 'react';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@mui/material/CardActions';
import { profilePage } from '../../../../../common/js/config';

function EmailNotFoundMessage({ onCloseModal, resetForm }) {
  return (
    <>
      <CardContent>
        <div className="new-b2b-connection-modal__response-title new-b2b-connection-modal__response-title--error">
          {profilePage.profileManager.b2bSection.userNotFound}
        </div>
        <div>{profilePage.profileManager.b2bSection.userNotFoundDescription}</div>

        <button type="submit" className="new-b2b-connection-modal__action-text" onClick={resetForm}>
          {profilePage.profileManager.b2bSection.tryAgain}
        </button>
      </CardContent>
      <CardActions style={{ justifyContent: 'right' }}>
        <button
          type="button"
          className="new-b2b-connection-modal__action-button"
          onClick={onCloseModal}
        >
          {profilePage.profileManager.b2bSection.cancel}
        </button>
      </CardActions>
    </>
  );
}

export default EmailNotFoundMessage;
