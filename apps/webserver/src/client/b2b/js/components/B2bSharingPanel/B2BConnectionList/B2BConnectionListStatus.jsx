import React from 'react';

const B2BConnectionListStatus = (props) => {
  const tagClassName = {
    connected: 'tag--green',
    expired: 'tag--gray',
    pending: 'tag--blue',
  };

  const { status, email } = props;

  return (
    <span className={`tag tag--small ${tagClassName[status]}`}>{status}</span>
  );
};

export default B2BConnectionListStatus;
