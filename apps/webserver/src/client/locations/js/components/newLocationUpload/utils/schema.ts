import { z } from 'zod';

const buildTrimmedRegexStringSchema = (regex: RegExp, message: string) =>
  z
    .string()
    .regex(regex, message)
    .refine((val) => val === val.trim(), {
      message: 'Leading or trailing spaces are not allowed',
    });

export const extendedLocationNameSchema = buildTrimmedRegexStringSchema(
  /^[a-zA-Z0-9 [\]().\-_]*$/,
  'Only letters, numbers, spaces, and []().-_ are allowed'
);

export const coordinateSchema = z.object({
  latitude: z
    .string()
    .nonempty('Enter the latitude')
    .max(19)
    .refine(
      (value) => {
        const normalizedValue = value.replace(',', '.');
        return Math.abs(Number(normalizedValue)) <= 90;
      },
      {
        message: 'This latitude is invalid',
      }
    ),
  longitude: z
    .string()
    .nonempty('Enter the longitude')
    .max(20)
    .refine(
      (value) => {
        const normalizedValue = value.replace(',', '.');
        return Math.abs(Number(normalizedValue)) <= 180;
      },
      {
        message: 'This longitude is invalid.',
      }
    ),
});

export const locationNameSchema = extendedLocationNameSchema.refine((val) => val.trim() !== '', {
  message: 'Enter location name',
});

export const listNameSchema = buildTrimmedRegexStringSchema(
  /^[a-zA-ZÀ-ÿ0-9 [\]()\-_]*$/,
  'Only letters (including accented characters), numbers, spaces, brackets [], parentheses (), dashes (-), and underscores (_) are allowed'
);
