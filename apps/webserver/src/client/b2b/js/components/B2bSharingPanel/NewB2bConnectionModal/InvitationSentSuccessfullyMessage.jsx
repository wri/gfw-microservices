import React from 'react';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@mui/material/CardActions';
import { profilePage } from '../../../../../common/js/config';

function invitationSentSuccessfullyMessage({ onCloseModal, resetForm, apiResponse }) {
  const { receiverEmail, receiverCompanyName } = apiResponse;
  return (
    <>
      <CardContent>
        <div className="new-b2b-connection-modal__response-title">
          {profilePage.profileManager.b2bSection.invitationSent}
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: profilePage.profileManager.b2bSection.invitationSentDescription(
              receiverEmail,
              receiverCompanyName
            ),
          }}
        />
        <button type="submit" className="new-b2b-connection-modal__action-text" onClick={resetForm}>
          {profilePage.profileManager.b2bSection.createANewConnection}
        </button>
      </CardContent>
      <CardActions style={{ justifyContent: 'right' }}>
        <button
          type="button"
          className="new-b2b-connection-modal__action-button"
          onClick={onCloseModal}
        >
          {profilePage.profileManager.b2bSection.ok}
        </button>
      </CardActions>
    </>
  );
}

export default invitationSentSuccessfullyMessage;
