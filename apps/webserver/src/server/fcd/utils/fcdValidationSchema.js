import { z } from 'zod';

const FcdValidationSchema = z.object({
  listId: z.coerce.number({
    message: 'Missing listId',
  }),
  category: z.string().transform((categoryParam) => {
    return categoryParam.split(',').map((val) => val.trim());
  }),
  country: z.string({
    message: 'Missing country',
  }),
  countryGadm: z.string({
    message: 'Missing country Gadm',
  }),
  locationId: z.optional(z.coerce.number()).catch(undefined),
});

module.exports = FcdValidationSchema;
