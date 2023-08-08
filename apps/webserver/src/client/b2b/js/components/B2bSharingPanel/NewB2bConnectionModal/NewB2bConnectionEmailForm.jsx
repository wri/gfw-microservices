import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@mui/material/CardActions';
import { validEmail } from '../../../../../locations/js/utils/validations';
import { profilePage } from '../../../../../common/js/config';
import { sendInvitation, checkUserBelongsToOrgAndIsAdmin } from '../fetchB2b';

function NewB2bConnectionEmailForm({ setApiResponse }) {
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [emailAndOrgNotMatchingError, setEmailAndOrgNotMatchingError] = useState(false);

  const handleSubmit = async () => {
    //    setEmailAndOrgNotMatchingError(false);
    const res = await checkUserBelongsToOrgAndIsAdmin(email, organizationName);
    if (res.status === 200 || res.status === 201) {
      const jsonResponse = await res.json();
      const sendInvitationRes = await sendInvitation(email, jsonResponse.organizationId);
      if (
        (sendInvitationRes && sendInvitationRes.status === 200) ||
        sendInvitationRes.status === 201
      ) {
        setApiResponse({
          result: 'success',
          receiverEmail: email,
          receiverCompanyName: organizationName,
        });
        return;
      }
    }

    if (res.status === 404) {
      setEmailAndOrgNotMatchingError(true);
      return;
    }

    setApiResponse({ result: 'connectionAlreadyExists' });
  };
  const isSubmitDisabled = !email || !validEmail(email) || !organizationName;

  return (
    <>
      <CardContent>
        <div>{profilePage.profileManager.b2bSection.sendInvitationDescription}</div>
        <TextField
          style={{ marginBottom: '10px' }}
          value={email}
          fullWidth
          error={emailAndOrgNotMatchingError}
          placeholder={profilePage.profileManager.b2bSection.email}
          onChange={(evt) => setEmail(evt.target.value)}
        />
        <TextField
          value={organizationName}
          fullWidth
          error={emailAndOrgNotMatchingError}
          placeholder={profilePage.profileManager.b2bSection.organizationName}
          onChange={(evt) => setOrganizationName(evt.target.value)}
        />
        {emailAndOrgNotMatchingError && (
          <div className="new-b2b-connection-modal__error-message">
            {profilePage.profileManager.b2bSection.emailAndOrgNotMatchingError}
          </div>
        )}
        <div
          dangerouslySetInnerHTML={{
            __html: profilePage.profileManager.b2bSection.termsOfUseWarning,
          }}
        />
      </CardContent>
      <CardActions style={{ justifyContent: 'right' }}>
        <button
          type="button"
          disabled={isSubmitDisabled}
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
