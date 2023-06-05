import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import Backdrop from '@mui/material/Backdrop';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import FactoryTwoToneIcon from '@mui/icons-material/FactoryTwoTone';
import BusinessCenterTwoToneIcon from '@mui/icons-material/BusinessCenterTwoTone';
import WorkTwoToneIcon from '@mui/icons-material/WorkTwoTone';
import FolderSharedTwoToneIcon from '@mui/icons-material/FolderSharedTwoTone';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import StoreTwoToneIcon from '@mui/icons-material/StoreTwoTone';
import B2bMultipleAccountsList from './B2bMultipleAccountsList';
import IconButton from '../../../../../common/js/components/IconButton';
import IconTimes from '../../../../../common/js/components/icon/IconTimes';
import InvitationSentSuccessfullyMessage from './InvitationSentSuccessfullyMessage';
import ConnectionAlreadyExistsMessage from './ConnectionAlreadyExistsMessage';
import EmailNotFoundMessage from './EmailNotFoundMessage';
import NotAnAdministratorMessage from './NotAnAdministratorMessage';
import NewB2bConnectionEmailForm from './NewB2bConnectionEmailForm';
import { profilePage } from '../../../../../common/js/config';
import { multipleConnectionsMock } from '../b2bConnectionsMock';
import './NewB2bConnectionModal.scss';

const icons = (
  <div className="new-b2b-connection-modal__icons">
    <div>
      <FactoryTwoToneIcon style={{ color: '#F24E1E' }} />
    </div>
    <div>
      <BusinessCenterTwoToneIcon style={{ color: '#1ABCFE' }} />
    </div>
    <div>
      <WorkTwoToneIcon style={{ color: '#000000' }} />
    </div>
    <div>
      <FolderSharedTwoToneIcon style={{ color: '#FF8A00', fontSize: '2.8rem' }} />
    </div>
    <div>
      <StorefrontTwoToneIcon style={{ color: '#FF0000' }} />
    </div>
    <div>
      <StoreTwoToneIcon style={{ color: '#A259FF' }} />
    </div>
    <div>
      <BusinessTwoToneIcon style={{ color: '#97BD3D' }} />
    </div>
  </div>
);

function NewB2bConnectionModal({ onCloseModal }) {
  const [apiResponse, setApiResponse] = useState('');

  const resetForm = () => {
    setApiResponse('');
  };

  let content;

  switch (apiResponse) {
    case 'success':
      content = (
        <InvitationSentSuccessfullyMessage onCloseModal={onCloseModal} resetForm={resetForm} />
      );
      break;
    case 'connectionAlreadyExists':
      content = <ConnectionAlreadyExistsMessage onCloseModal={onCloseModal} />;
      break;
    case 'emailNotFound':
      content = <EmailNotFoundMessage onCloseModal={onCloseModal} resetForm={resetForm} />;
      break;
    case 'notAnAdministrator':
      content = <NotAnAdministratorMessage onCloseModal={onCloseModal} resetForm={resetForm} />;
      break;
    case 'multipleAccounts':
      content = (
        <B2bMultipleAccountsList
          accountsList={multipleConnectionsMock}
          onCloseModal={onCloseModal}
        />
      );
      break;
    default:
      content = <NewB2bConnectionEmailForm setApiResponse={setApiResponse} />;
  }

  return (
    <Backdrop style={{ zIndex: '1' }} open>
      <ClickAwayListener onClickAway={onCloseModal}>
        <Card className="new-b2b-connection-modal" variant="outlined">
          <div className="new-b2b-connection-modal__header">
            <div>{profilePage.profileManager.b2bSection.createNewB2bConnection}</div>
            <IconButton icon={<IconTimes />} onClick={onCloseModal} size="large" />
          </div>
          {icons}
          {content}
        </Card>
      </ClickAwayListener>
    </Backdrop>
  );
}

export default NewB2bConnectionModal;
