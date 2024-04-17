import { z } from 'zod';

const analysisIdsMap = {
  Alerts: 'ALERTS',
  FCD: 'FCD',
  DefReport: 'AFI',
};

const analysisIdsInputArray = Object.keys(analysisIdsMap) as [keyof typeof analysisIdsMap];

export const analysisIdSchema = z.enum(analysisIdsInputArray).transform((x) => analysisIdsMap[x]);

export const analysisIdsCsvSchema = z
  .string()
  .transform((x) => Array.from(new Set(x.replace(/ /g, '').split(','))))
  .pipe(z.array(analysisIdSchema));
