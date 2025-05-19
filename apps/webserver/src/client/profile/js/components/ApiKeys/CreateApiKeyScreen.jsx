import { Api, Add } from '@mui/icons-material';

import { PillButton } from '../../../../components';

export default function CreateApiKeyScreen({ fetchApiKeys, setIsLoading }) {
  const createApiKey = () => {
    setIsLoading(true);
    fetch('api/profile/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then(fetchApiKeys)
      .catch((error) => {
        console.error('Error', error);
      });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Api style={{ color: '#999999', fontSize: '70px' }} height="60px">
        api
      </Api>
      <h3>Create your API Key</h3>
      <div>API keys allows users to access your API and view data from your locations.</div>
      <br />
      <PillButton
        variant="contained"
        size="small"
        onClick={createApiKey}
        startIcon={<Add />}
        sx={{ mx: 'auto' }}
      >
        Create
      </PillButton>
    </div>
  );
}
