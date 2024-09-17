import { z } from 'zod';

export const serverConfigSchema = z.object({
  MSSQL_HOSTNAME: z.string().ip(),
  MSSQL_PORT: z.coerce.number(),
  MSSQL_DATABASE: z.string().default('gfwpro'),
  MSSQL_USERNAME: z.string(),
  MSSQL_PASSWORD: z.string(),

  NODE_ENV: z.enum(['development', 'test', 'staging', 'ProdV2', 'qa']),
  PORT: z.coerce.number().default(3336),

  AWS_TMP_BUCKET: z.string(),
  SES_SENDER_EMAIL: z.string().email(),
  LIST_PROCESSING_MICROSERVICE_URL: z.string().url(),
});

export type ServerConfigType = z.infer<typeof serverConfigSchema>;
