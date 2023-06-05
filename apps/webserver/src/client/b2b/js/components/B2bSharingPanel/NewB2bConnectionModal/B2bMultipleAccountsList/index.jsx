import React, { useState } from 'react';
import CardActions from '@mui/material/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { profilePage } from '../../../../../../common/js/config';
import SquadList from '../../../../../../common/js/components/SquadList';

function B2bMultipleAccountsList({ accountsList, onCloseModal }) {
  const [selectedAccount, setSelectedAccount] = useState(null);
  return (
    <>
      <CardContent>
        <div className="new-b2b-connection-modal__response-title new-b2b-connection-modal__response-title--warning">
          {profilePage.profileManager.b2bSection.multipleAccountsMessage}
        </div>
        <div>{profilePage.profileManager.b2bSection.multipleAccountsDescription}</div>

        <SquadList
          data={accountsList}
          activeItem={selectedAccount}
          setActiveItem={setSelectedAccount}
        />
      </CardContent>
      <CardActions style={{ justifyContent: 'right' }}>
        <button
          type="button"
          className="new-b2b-connection-modal__action-button"
          onClick={onCloseModal}
        >
          {profilePage.profileManager.b2bSection.cancel}
        </button>
        <button
          type="button"
          disabled={!selectedAccount}
          className="new-b2b-connection-modal__action-button"
          onClick={onCloseModal}
        >
          {profilePage.profileManager.b2bSection.sendInvitation}
        </button>
      </CardActions>
    </>
  );
}

export default B2bMultipleAccountsList;
