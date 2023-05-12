import React from 'react';
import { acceptConnection, resendInvitation, cancelConnection } from '../fetchB2b';

const B2BConnectionListStatus = (props) => {
  const tagClassName = {
    connected: 'tag--green',
    expired: 'tag--gray',
    pending: 'tag--blue',
  };

  const buttonText = {
    connected: 'Remove',
    expired: 'Resend',
    pending: 'Cancel',
  };


  const { status, email } = props;
  const handleSubmit = () => {
    if (status === 'pending') {
      return acceptConnection(email);
    }

    if (status === 'expired') {
      return resendInvitation(email);
    }

    if (status === 'connected') {
      return cancelConnection(email);
    }
  };

  return (
    <>
      <span className={`tag tag--small ${tagClassName[status]}`}>{status}</span>
      <button type="button" className="button--link" onClick={handleSubmit}>
        {buttonText[status]}
      </button>
    </>
  );
};

export default B2BConnectionListStatus;
