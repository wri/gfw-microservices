import { z } from 'zod';

// TODO: check if replace is in order in favor of already existing: libs/constants/src/lib/analysisTypes.constants.ts
const analysisIdsMap = {
  Alerts: 'ALERTS',
  FCD: 'FCD',
  DefReport: 'AFI',
};

const analysisIdsInputArray = Object.keys(analysisIdsMap) as [string];

export const analysisIdSchema = z.enum(analysisIdsInputArray).transform((x) => analysisIdsMap[x]);

export const analysisIdsCsvSchema = z
  .string()
  .transform((x) => Array.from(new Set(x.replace(/ /g, '').split(','))))
  .pipe(z.array(analysisIdSchema));
