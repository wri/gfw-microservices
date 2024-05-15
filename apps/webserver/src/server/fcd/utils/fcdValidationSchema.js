import { z } from 'zod';

export const FcdValidationSchema = z.object({
  listId: z.coerce.number({
    required_error: 'Missing listId',
  }),
  category: z.string().transform((categoryParam) => {
    return categoryParam.split(',').map((val) => val.trim());
  }),
  country: z.string({
    required_error: 'Missing country',
  }),
  countryGadm: z.string({
    required_error: 'Missing country Gadm',
  }),
  locationId: z.optional(z.coerce.number()).catch(undefined),
});
