import React, { useState } from 'react';
import Icon from '@material-ui/core/Icon';
import Button from '../../../../common/js/components/Button';
import IconPlus from '../../../../common/js/components/icon/IconPlus';
import Loading from '../../../../common/js/components/Loaders/Loading';

export default function CreateApiKeyScreen({ setKeys }) {
  const [isLoading, setIsLoading] = useState(false);

  const createApiKey = () => {
    setIsLoading(true);
    fetch('api/profile/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then(setKeys)
      .catch((error) => {
        console.error('Error', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return <Loading />;
  }

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
        onClick={createApiKey}
        icon={<IconPlus height="10px" />}
        label={'Create'}
      />
    </div>
  );
}
