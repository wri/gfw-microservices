import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { profilePage } from '../../config';

function SquadListItem({ country, organizationName, status, activeItem, setActiveItem }) {
  const selected = activeItem === country;
  const pending = status === 'pending';

  return (
    <Card
      className={`b2b-connection-item ${pending ? 'b2b-connection-item--pending' : ''} ${
        selected ? 'b2b-connection-item--selected' : ''
      }`}
      variant="outlined"
      onClick={() => {
        if (!pending) {
          setActiveItem(country);
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
        {pending && (
          <div className="b2b-connection-item__pending-action">{profilePage.profileManager.b2bSection.pending}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default SquadListItem;
