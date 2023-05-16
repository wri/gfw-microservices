import React, { useState } from 'react';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@mui/material/CardActions';
import { validEmail } from '../../../../../locations/js/utils/validations';
import { profilePage } from '../../../../../common/js/config';
import { sendInvitation } from '../fetchB2b';

function NewB2bConnectionEmailForm({ setApiResponse }) {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    sendInvitation(email)
      .then(() => {
        setApiResponse('success');
      })
      .catch((err) => {
        if (err === 401) {
          return setApiResponse('emailNotFound');
        }

        setApiResponse('connectionAlreadyExists');
      });
  };

  return (
    <>
      <CardContent>
        <div>{profilePage.profileManager.b2bSection.sendInvitationDescription}</div>
        <div className="input-search">
          <input
            type="search"
            value={email}
            aria-label={profilePage.profileManager.b2bSection.email}
            placeholder={profilePage.profileManager.b2bSection.email}
            onChange={(evt) => setEmail(evt.target.value)}
          />
          <div dangerouslySetInnerHTML={{ __html: profilePage.profileManager.b2bSection.termsOfUseWarning }} />
        </div>
      </CardContent>
      <CardActions style={{ justifyContent: 'right' }}>
        <button
          type="button"
          disabled={!email || !validEmail(email)}
          className="new-b2b-connection-modal__action-button"
          onClick={handleSubmit}
        >
          {profilePage.profileManager.b2bSection.sendInvitation}
        </button>
      </CardActions>
    </>
  );
}

export default NewB2bConnectionEmailForm;
