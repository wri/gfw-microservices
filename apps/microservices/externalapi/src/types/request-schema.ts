import { z } from 'zod';

export const requestSchema = z.object({
  user: z.object({
    organizationId: z.number(),
    hasValidEmail: z.boolean().optional(),
    organization_user_id: z.number().optional(),
  }),
});

export type RequestSchema = z.infer<typeof requestSchema>;
