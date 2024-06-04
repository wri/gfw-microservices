import { z } from 'zod';

export const envSchema = z.object({
  MSSQL_HOSTNAME: z.string().ip(),
  MSSQL_PORT: z.coerce.number(),
  MSSQL_DATABASE: z.string(),
  MSSQL_USERNAME: z.string(),
  MSSQL_PASSWORD: z.string(),

  PORT: z.coerce.number().default(3337),

  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),

  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  LARGE_PROCESSING_LIST_BUCKET: z.string(),

  AWS_ANALYSIS_QUEUE: z.string().url(),
  AWS_DOWNLOAD_QUEUE: z.string().url(),
  AWS_API_USAGE_PLAN_ID: z.string(),

  LLP_BASE_URL: z.string().url(),

  LATEST_COMMIT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
