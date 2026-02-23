import { z } from 'zod';

export const serverConfigSchema = z.object({
  MSSQL_HOSTNAME: z.string().ip(),
  MSSQL_PORT: z.coerce.number(),
  MSSQL_DATABASE: z.string(),
  MSSQL_USERNAME: z.string(),
  MSSQL_PASSWORD: z.string(),

  PORT: z.coerce.number().default(3335),

  NODE_ENV: z.enum(['development', 'test', 'staging', 'ProdV2', 'qa']),

  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  LARGE_PROCESSING_LIST_BUCKET: z.string(),
  AWS_ANALYSIS_QUEUE: z.string().url(),
  LD_MICROSERVICE_URL: z.string().url(),
  // AWS_API_USAGE_PLAN_ID removed - not supported in API Gateway V2 (HTTP APIs),
  // Deprecated by https://github.com/wri/gfwpro-apigateway-terraform/pull/57
  LLP_BASE_URL: z.string().url(),

  LATEST_COMMIT: z.string().optional(),
});

export type ServerConfigType = z.infer<typeof serverConfigSchema>;
