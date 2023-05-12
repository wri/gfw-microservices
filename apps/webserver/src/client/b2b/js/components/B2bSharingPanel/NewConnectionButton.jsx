import React, { useState } from 'react';
import NewB2bConnectionModal from './NewB2bConnectionModal';
import Button from '../../../../common/js/components/Button';
import IconPlus from '../../../../common/js/components/icon/IconPlus';
import { profilePage } from '../../../../common/js/config';

function NewConnectionButton() {
  const [displayModal, setDisplayModal] = useState(false);
  return (
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
  );
}

export default NewConnectionButton;
