import { z } from 'zod';

export const serverConfigSchema = z.object({
  MSSQL_HOSTNAME: z.string().ip(),
  MSSQL_PORT: z.coerce.number(),
  MSSQL_DATABASE: z.string(),
  MSSQL_USERNAME: z.string(),
  MSSQL_PASSWORD: z.string(),

  NODE_ENV: z.enum(['development', 'test', 'staging', 'production', 'qa']),
  PORT: z.coerce.number().default(3333),

  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  LARGE_PROCESSING_LIST_BUCKET: z.string(),
  LARGE_LIST_PROCESSING_ENDPOINT: z.string().url(),

  MICROSERVICES_ENV: z.enum(['LATEST', 'DEVELOPMENT']),

  LATEST_COMMIT: z.string().optional(),
});

export type ServerConfigType = z.infer<typeof serverConfigSchema>;
