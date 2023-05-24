import React, { useState } from 'react';
import B2bConnectionDetailsModal from './B2bConnectionDetailsModal';

function ConnectionDetailsButton({ connectionData }) {
  const [displayModal, setDisplayModal] = useState(false);

  return (
    <>
      <button
        type="button"
        className="new-b2b-connection-modal__action-button"
        onClick={() => {
          setDisplayModal(true);
        }}
      >
        Details
      </button>
      {displayModal && (
        <B2bConnectionDetailsModal onCloseModal={() => setDisplayModal(false)} connectionData={connectionData} />
      )}
    </>
  );
}

export default ConnectionDetailsButton;
