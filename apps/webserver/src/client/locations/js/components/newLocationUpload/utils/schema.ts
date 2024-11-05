import { z } from 'zod';

export const coordinateSchema = z.object({
  latitude: z
    .string()
    .refine((value) => {
      const latitude = Math.abs(Number(value));
      const hasDecimalPlaces = value.includes('.');
      return hasDecimalPlaces && latitude <= 90;
    })
    .optional(),
  longitude: z
    .string()
    .refine((value) => {
      const longitude = Math.abs(Number(value));
      const hasDecimalPlaces = value.includes('.');
      return hasDecimalPlaces && longitude <= 180;
    })
    .optional(),
});
