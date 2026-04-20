import { z } from 'zod';

const analysisIdsMap = {
  Alerts: 'ALERTS',
  FCD: 'FCD',
  DefReport: 'AFI',
  GHG: 'GHG',
};

// Reverse mapping: DB format -> API format
export const dbToApiFormat: Record<string, string> = {
  ALERTS: 'Alerts',
  FCD: 'FCD',
  AFI: 'DefReport',
  GHG: 'GHG',
};

const analysisIdsInputArray = Object.keys(analysisIdsMap) as [keyof typeof analysisIdsMap];

export const analysisIdSchema = z.enum(analysisIdsInputArray).transform((x) => analysisIdsMap[x]);

export const analysisIdsCsvSchema = z
  .string()
  .transform((x) => Array.from(new Set(x.replace(/ /g, '').split(','))))
  .pipe(z.array(analysisIdSchema));
