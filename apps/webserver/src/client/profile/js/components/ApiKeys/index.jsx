import React, { useState } from 'react';
import CreateApiKeyScreen from './CreateApiKeyScreen';
import ApiKeysTable from './ApiKeysTable';

export default function ApiKeys() {
  const [keys, setKeys] = useState({});

  return !keys.length ? <CreateApiKeyScreen setKeys={setKeys} /> : <ApiKeysTable keys={keys} />;
}
