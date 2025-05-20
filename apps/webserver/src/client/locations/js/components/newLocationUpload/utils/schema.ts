import { z } from 'zod';

const validCoordinateFormat = /^-?\d+\.\d+$/;

export const alphanumericWithSpaceSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9 [\]().\-_]*$/,
    'Only letters, numbers, spaces, and special characters []().-_. are allowed'
  )
  .refine((val) => val === val.trim(), {
    message: 'Leading or trailing spaces are not allowed',
  });

export const coordinateSchema = z.object({
  latitude: z
    .string()
    .max(19)
    .refine(
      (value) => {
        const normalizedValue = value.replace(',', '.');
        const latitude = Math.abs(Number(normalizedValue));
        return validCoordinateFormat.test(value) && latitude <= 90;
      },
      {
        message: 'This latitude is invalid. Please ensure your it is in decimal degree notation',
      }
    ),
  longitude: z
    .string()
    .max(20)
    .refine(
      (value) => {
        const normalizedValue = value.replace(',', '.');
        const longitude = Math.abs(Number(normalizedValue));
        return validCoordinateFormat.test(value) && longitude <= 180;
      },
      {
        message: 'This longitude is invalid. Please ensure your it is in decimal degree notation',
      }
    ),
});

export const locationNameSchema = alphanumericWithSpaceSchema.refine((val) => val.trim() !== '', {
  message: 'Enter location name',
});
