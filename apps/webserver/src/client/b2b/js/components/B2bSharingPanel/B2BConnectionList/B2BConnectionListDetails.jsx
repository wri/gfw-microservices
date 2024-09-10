import React from 'react';
import { profilePage } from '../../../../../common/js/config';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import { useCancel, useReject } from '../hooks';

export default function B2BConnectionListDetails(props) {
  const { onclickDetails, row } = props;

  const [, cancelConnection] = useCancel();
  const [, rejectConnection] = useReject();

  const status = {
    pending: {
      label: 'cancel',
      onclick: () => cancelConnection(row.id),
      classColor: '',
      icon: <CancelIcon />,
    },
    connected: {
      label: 'remove',
      onclick: () => rejectConnection(row.id),
      classColor: 'red',
      icon: <CloseIcon />,
    },
  };

  const currentStatus = status[row.status];
  const showStatusButton = row.isCurrentOrganization && !!currentStatus;

  return (
    <>
      {showStatusButton && (
        <button
          type="button"
          className={`new-b2b-connection-modal__action-button ${currentStatus.classColor}`}
          onClick={() => {
            currentStatus.onclick();
          }}
        >
          {currentStatus.icon} {currentStatus.label}
        </button>
      )}

      {!row.isCurrentOrganization && (
        <button
          type="button"
          className="new-b2b-connection-modal__action-button"
          onClick={() => {
            onclickDetails(row);
          }}
        >
          {profilePage.profileManager.b2bSection.details}
        </button>
      )}
    </>
  );
}
