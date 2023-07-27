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
import { useCancel, useAccept, useReject } from '../hooks';
import './B2bConnectionDetailsModal.scss';
import CircularProgress from '@mui/material/CircularProgress';

function B2bConnectionDetailsModal({ onCloseModal, connectionData }) {
  const { targetOrganizationName, status, name, editorEmail, id, isCurrentOrganization } =
    connectionData;
  const [isCancelling, cancelConnection] = useCancel();
  const [isAccepting, acceptConnection] = useAccept();
  const [isRejecting, rejectConnection] = useReject();
  return (
    <>
      <Backdrop style={{ zIndex: '1' }} open>
        <Card className="b2b-connection-details-modal" variant="outlined">
          <div className="b2b-connection-details-modal__header">
            <div>{targetOrganizationName}</div>
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
                  {profilePage.profileManager.b2bSection.name}
                </div>
                <div>{name}</div>
              </div>
              <div>
                <div className="b2b-connection-details-modal__label">
                  {profilePage.profileManager.b2bSection.email}
                </div>
                <div>
                  <a href={`mailto:${editorEmail}`}>{editorEmail}</a>
                </div>
              </div>
            </div>
          </CardContent>
          <CardActions style={{ justifyContent: 'right' }}>
            {isCurrentOrganization && (
              <>
                <button
                  type="button"
                  className="b2b-connection-details-modal__action-button"
                  onClick={async () => {
                    await cancelConnection(id);
                    onCloseModal();
                  }}
                >
                  {profilePage.profileManager.b2bSection.cancelConnection}
                </button>

                <Button
                  variant="primary"
                  style={{ textTransform: 'unset', margin: '10px' }}
                  onClick={() => onCloseModal()}
                  label={profilePage.profileManager.b2bSection.close}
                />
              </>
            )}

            {!isCurrentOrganization && (
              <>
                <button
                  type="button"
                  className="b2b-connection-details-modal__action-button"
                  onClick={async () => {
                    await rejectConnection(id);
                    onCloseModal();
                  }}
                >
                  {profilePage.profileManager.b2bSection.reject}
                </button>
                <Button
                  variant="primary"
                  style={{ textTransform: 'unset', margin: '10px' }}
                  onClick={async () => {
                    await acceptConnection(id);
                    onCloseModal();
                  }}
                  label={profilePage.profileManager.b2bSection.accept}
                />
              </>
            )}
          </CardActions>
        </Card>
      </Backdrop>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isCancelling || isAccepting || isRejecting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export default B2bConnectionDetailsModal;
