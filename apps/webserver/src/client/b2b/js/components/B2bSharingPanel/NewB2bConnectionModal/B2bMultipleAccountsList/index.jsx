import React, { useState } from 'react';
import CardActions from '@mui/material/CardActions';
import CardContent from '@material-ui/core/CardContent';
import B2bMultipleAccountsItem from './B2bMultipleAccountsItem';
import { profilePage } from '../../../../../../common/js/config';

function B2bMultipleAccountsList({ accountsList, onCloseModal }) {
  const [selectedAccount, setSelectedAccount] = useState(null);

  const b2bConnections = accountsList.map((connection) => (
    <B2bMultipleAccountsItem
      country={connection.country}
      organizationName={connection.organizationName}
      date={connection.date}
      status={connection.status}
      selectedAccount={selectedAccount}
      setSelectedAccount={setSelectedAccount}
    />
  ));

  return (
    <>
      <CardContent>
        <div className="new-b2b-connection-modal__response-title new-b2b-connection-modal__response-title--warning">
          {profilePage.profileManager.b2bSection.multipleAccountsMessage}
        </div>
        <div>{profilePage.profileManager.b2bSection.multipleAccountsDescription}</div>

        <div>{b2bConnections}</div>
      </CardContent>
      <CardActions style={{ justifyContent: 'right' }}>
        <button type="button" className="new-b2b-connection-modal__action-button" onClick={onCloseModal}>
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
