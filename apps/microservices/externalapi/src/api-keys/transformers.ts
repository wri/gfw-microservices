import { ViewApiKeyResponse } from './dtos';
import { ExternalAPIKey } from './external-api-key.entity';

export function transformApiKey(apiKey: ExternalAPIKey): ViewApiKeyResponse {
  return {
    id: apiKey.awsId,
    apiKey: apiKey.apiKey,
    apiGroups: apiKey.apiGroups,
    creatorUserEmail: apiKey.user.user_email,
    organizationId: apiKey.organizationId,
    creationDate: apiKey.updateDateTime,
  };
}

export function transformApiKeys(apiKeys: ExternalAPIKey[]): ViewApiKeyResponse[] {
  return apiKeys.map(transformApiKey);
}
