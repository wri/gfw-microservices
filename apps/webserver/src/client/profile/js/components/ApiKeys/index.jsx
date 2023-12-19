import React, { useState, useEffect } from 'react';
import CreateApiKeyScreen from './CreateApiKeyScreen';
import ApiKeysTable from './ApiKeysTable';
import Loading from '../../../../common/js/components/Loaders/Loading';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApiKeys = () => {
    fetch('api/profile/api-keys', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then(setKeys)
      .catch((error) => {
        console.error('Error fetching data: ', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteKey = (id) => {
    setIsLoading(true);
    fetch(`api/profile/api-keys/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .catch((error) => {
        console.error('Error deleting key: ', error);
      })
      .finally(() => {
        fetchApiKeys();
      });
  };

  useEffect(() => {
    fetchApiKeys();
  }, [keys.length]);

  if (isLoading) {
    return <Loading />;
  }

  return keys.length ? (
    <ApiKeysTable keys={keys} deleteKey={deleteKey} />
  ) : (
    <CreateApiKeyScreen setKeys={setKeys} setIsLoading={setIsLoading} />
  );
}
