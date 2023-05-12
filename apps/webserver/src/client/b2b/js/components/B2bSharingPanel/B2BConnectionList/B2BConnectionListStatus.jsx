import React from 'react';

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

  const { status } = props;
  return (
    <>
      <span className={`tag tag--small ${tagClassName[status]}`}>{status}</span>
      <button className='button--link'>{buttonText[status]}</button>
    </>
  );
}

export default B2BConnectionListStatus;
