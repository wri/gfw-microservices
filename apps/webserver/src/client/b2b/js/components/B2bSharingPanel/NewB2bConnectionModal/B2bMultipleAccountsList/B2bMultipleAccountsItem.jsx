import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { profilePage } from '../../../../../../common/js/config';
import '../../B2bConnectionItem.scss';

function B2bMultipleAccountsItem({ country, organizationName, status, selectedAccount, setSelectedAccount }) {
  let action;

  switch (status) {
    case 'pending':
      action = (
        <div className="b2b-connection-item__pending-action">{profilePage.profileManager.b2bSection.pending}</div>
      );
      break;
    case 'connected':
      action = null;
      break;
    case 'expired':
      action = null;
      break;
    default:
  }

  const selected = selectedAccount === country;
  const pending = status === 'pending';

  return (
    <Card
      className={`b2b-connection-item ${pending ? 'b2b-connection-item--pending' : ''} ${
        selected ? 'b2b-connection-item--selected' : ''
      }`}
      variant="outlined"
      onClick={() => {
        if (!pending) {
          setSelectedAccount(country);
        }
      }}
    >
      <CardContent
        className={`b2b-connection-item__content ${
          status === 'pending' ? 'b2b-connection-item__content--pending' : ''
        } ${selected ? 'b2b-connection-item__content--selected' : ''}`}
      >
        <div>
          <div className="b2b-connection-item__country-name">{country}</div>
          <div>{organizationName}</div>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

export default B2bMultipleAccountsItem;
