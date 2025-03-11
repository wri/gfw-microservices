import React, { useState } from 'react';
import NewB2bConnectionModal from './NewB2bConnectionModal';
import Button from '../../../../common/js/components/Button';
import IconPlus from '../../../../common/js/components/icon/IconPlus';
import { profilePage } from '../../../../common/js/config';
import B2BComingSoon from './B2BConnectionList/B2BComingSoon';

function NewConnectionButton() {
  const [displayModal, setDisplayModal] = useState(false);

  const B2bConnectionsEnabled = true;
  return B2bConnectionsEnabled ? (
    <>
      <Button
        variant="primary"
        style={{ textTransform: 'unset', margin: '10px' }}
        onClick={() => {
          setDisplayModal(true);
        }}
        icon={<IconPlus height="10px" />}
        label={profilePage.profileManager.b2bSection.createNewB2bConnection}
      />
      {displayModal && <NewB2bConnectionModal onCloseModal={() => setDisplayModal(false)} />}
    </>
  ) : (
    <B2BComingSoon />
  );
}

export default NewConnectionButton;
