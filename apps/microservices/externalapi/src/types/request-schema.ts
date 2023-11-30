import { z } from 'zod';

export const requestSchema = z.object({
  user: z.object({
    organizationId: z.number(),
  }),
});

export type RequestSchema = z.infer<typeof requestSchema>;
