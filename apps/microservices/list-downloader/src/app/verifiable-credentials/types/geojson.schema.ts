import { z } from 'zod';

export const geoJsonSchema = z.object({
  Location_Name: z.string(),
  Centroid_Country: z.string(),
  Location_HA: z.number(),
  SBTN_Natural_Forest_HA: z.number(),
  SBTN_Natural_Forest_Loss_Post_2020_HA: z.number(),
  JRC_Forest_HA: z.number(),
  JRC_Forest_Loss_Post_2020_HA: z.number(),
  Analysis_Time: z.string(),
  GFWPro_Account: z.number(),
  Use_Rights: z.string(),
});

export type GeoJsonSchema = z.infer<typeof geoJsonSchema>;
