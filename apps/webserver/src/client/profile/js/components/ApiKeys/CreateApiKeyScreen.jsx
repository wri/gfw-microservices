import React from 'react';
import Icon from '@material-ui/core/Icon';
import Button from '../../../../common/js/components/Button';
import IconPlus from '../../../../common/js/components/icon/IconPlus';

const keysMock = [
  {
    id: 1,
    key: '1adf235312342311fad98',
    creationDate: new Date().toDateString(),
  },
];

export default function CreateApiKeyScreen({ setKeys }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Icon style={{ color: '#999999', fontSize: '70px' }} height="60px">
        api
      </Icon>
      <h3>Create your API Key</h3>
      <div>API keys allows users to access your API and view data from your locations.</div>
      <br />
      <Button
        variant="primary"
        className="users-section__action-button"
        onClick={() => {
          setKeys(keysMock);
        }}
        icon={<IconPlus height="10px" />}
        label={'Create'}
      />
    </div>
  );
}
