import React from 'react';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@mui/material/CardActions';
import { profilePage } from '../../../../../common/js/config';

function NotAnAdministratorMessage({ onCloseModal, resetForm }) {
  return (
    <>
      <CardContent>
        <div className="new-b2b-connection-modal__response-title new-b2b-connection-modal__response-title--warning">
          {profilePage.profileManager.b2bSection.notAdministrator}
        </div>
        <div>{profilePage.profileManager.b2bSection.notAdministratorDescription}</div>

        <button type="submit" className="new-b2b-connection-modal__action-text" onClick={resetForm}>
          {profilePage.profileManager.b2bSection.tryAgain}
          <div style={{ color: 'black', paddingLeft: '5px' }}>
            {profilePage.profileManager.b2bSection.withAnAdministratorEmail}
          </div>
        </button>
      </CardContent>
      <CardActions style={{ justifyContent: 'right' }}>
        <button type="button" className="new-b2b-connection-modal__action-button" onClick={onCloseModal}>
          {profilePage.profileManager.b2bSection.cancel}
        </button>
      </CardActions>
    </>
  );
}

export default NotAnAdministratorMessage;
