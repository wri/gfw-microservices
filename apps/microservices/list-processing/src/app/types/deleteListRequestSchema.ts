import { z } from 'zod';

export const deleteListBodySchema = z.object({
  userEmail: z.string().email(),
  organization_user_id: z.number(),
  organizationDatabase: z.string(),
});
