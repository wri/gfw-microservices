import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import Backdrop from '@mui/material/Backdrop';
import ClickAwayListener from '@mui/base/ClickAwayListener';
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
import B2BImageList from '../B2BConnectionList/B2BImageList';

function NewB2bConnectionModal({ onCloseModal }) {
  const [apiResponse, setApiResponse] = useState(null);

  const resetForm = () => {
    setApiResponse(null);
  };

  let content;

  switch (apiResponse?.result) {
    case 'success':
      content = (
        <InvitationSentSuccessfullyMessage
          onCloseModal={onCloseModal}
          resetForm={resetForm}
          apiResponse={apiResponse}
        />
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
          <B2BImageList />
          {content}
        </Card>
      </ClickAwayListener>
    </Backdrop>
  );
}

export default NewB2bConnectionModal;
