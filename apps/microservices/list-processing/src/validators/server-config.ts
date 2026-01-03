import { z } from 'zod';

export const serverConfigSchema = z.object({
  MSSQL_HOSTNAME: z.string().ip(),
  MSSQL_PORT: z.coerce.number(),
  MSSQL_DATABASE: z.string(),
  MSSQL_USERNAME: z.string(),
  MSSQL_PASSWORD: z.string(),

  NODE_ENV: z.enum(['development', 'test', 'staging', 'ProdV2', 'qa']),
  PORT: z.coerce.number().default(3333),

  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_ANALYSIS_LAMBDA_URL: z.string().url(),
  LARGE_PROCESSING_LIST_BUCKET: z.string(),
  LARGE_LIST_PROCESSING_ENDPOINT: z.string().url(),

  MICROSERVICES_ENV: z.enum(['LATEST', 'DEVELOPMENT', 'QA', 'PRODV2', 'STAGING']),

  LARGE_PROCESSING_LIST_ERROR_BUCKET: z.string(),

  GFW_DATASET_API_URL: z.string().url(),
  GFW_DATA_API_KEY: z.string(),

  LATEST_COMMIT: z.string().optional(),

  SES_SENDER_EMAIL: z.string().email(),

  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  REDIS_CONNECT_TIMEOUT: z.coerce.number().optional(),
});

export type ServerConfigType = z.infer<typeof serverConfigSchema>;
