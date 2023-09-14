import { Token } from './token.entity';

export interface ViewApiKeyResponse {
  id: string;
  apiKey: string;
  apiGroup: string;
  creatorUserEmail: string;
  organizationId: number;
  creationDate: Date;
}

export function transformApiKey(apiKey: Token): ViewApiKeyResponse {
  return {
    id: apiKey.id,
    apiKey: apiKey.apiKey,
    apiGroup: apiKey.apiGroup,
    creatorUserEmail: apiKey.user.email,
    organizationId: apiKey.organizationId,
    creationDate: apiKey.createdDateTime,
  };
}

export function transformApiKeys(apiKeys: Token[]): ViewApiKeyResponse[] {
  return apiKeys.map(transformApiKey);
}
