import { fcdCategoriesMap } from '@wri-monorepos/constants';
import { z } from 'zod';

const FcdValidationSchema = z.object({
  listId: z.coerce.number({
    message: 'Missing listId',
  }),
  category: z
    .string()
    .transform((categoryParam) => {
      return categoryParam.split(',').map((val) => val.trim());
    })
    .refine(
      (categoriesArr) => {
        return categoriesArr.every((category) => Object.keys(fcdCategoriesMap).includes(category));
      },
      {
        message: `Unhandled or Missing Category`,
      }
    ),
  country: z.string({
    message: 'Missing country',
  }),
  countryGadm: z.string({
    message: 'Missing country gadmid',
  }),
  locationId: z.optional(z.coerce.number()).catch(undefined),
});

module.exports = FcdValidationSchema;
