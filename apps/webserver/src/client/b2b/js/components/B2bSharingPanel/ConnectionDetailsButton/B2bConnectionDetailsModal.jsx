import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@mui/material/CardActions';
import Backdrop from '@mui/material/Backdrop';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import Button from '../../../../../common/js/components/Button';
import IconButton from '../../../../../common/js/components/IconButton';
import IconTimes from '../../../../../common/js/components/icon/IconTimes';
import { profilePage } from '../../../../../common/js/config';
import { acceptConnection, rejectConnection } from '../fetchB2b';
import './B2bConnectionDetailsModal.scss';

function B2bConnectionDetailsModal({ onCloseModal, connectionData }) {
  const { organizationName, status, name, email, id } = connectionData;

  return (
    <Backdrop style={{ zIndex: '1' }} open>
      <ClickAwayListener onClickAway={onCloseModal}>
        <Card className="b2b-connection-details-modal" variant="outlined">
          <div className="b2b-connection-details-modal__header">
            <div>{organizationName}</div>
            <IconButton icon={<IconTimes />} onClick={onCloseModal} size="large" />
          </div>
          <CardContent>
            <div className="b2b-connection-details-modal__label">
              {profilePage.profileManager.b2bSection.status}
            </div>
            <div className="b2b-connection-details-modal__status">{status}</div>
            <div className="b2b-connection-details-modal__title">
              {profilePage.profileManager.b2bSection.accountManagerInformation}
            </div>
            <div className="b2b-connection-details-modal__manager-info">
              <div>
                <div className="b2b-connection-details-modal__label">
                  {profilePage.profileManager.b2bSection.email}
                </div>
                <div>{name}</div>
              </div>
              <div>
                <div className="b2b-connection-details-modal__label">
                  {profilePage.profileManager.b2bSection.email}
                </div>
                <div>
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              </div>
            </div>
          </CardContent>
          <CardActions style={{ justifyContent: 'right' }}>
            <button
              type="button"
              className="b2b-connection-details-modal__action-button"
              onClick={() => rejectConnection(id)}
            >
              {profilePage.profileManager.b2bSection.reject}
            </button>
            <Button
              variant="primary"
              style={{ textTransform: 'unset', margin: '10px' }}
              onClick={() => acceptConnection(id)}
              label="Accept"
            />
          </CardActions>
        </Card>
      </ClickAwayListener>
    </Backdrop>
  );
}

export default B2bConnectionDetailsModal;
