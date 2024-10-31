import { z } from 'zod';

const CoordinatesSchema = z.array(z.tuple([z.number(), z.number()]));

const PropertiesSchema = z.object({
  Location_Name: z.string(),
  Latitude: z.string(),
  Longitude: z.string(),
  Analysis_Radius: z.string(),
  Analysis_Area: z.string(),
  Location_Classification: z.string(),
  Company_ID: z.string(),
  Volume: z.string(),
  Owner_Name: z.string().optional(),
  Owner_ID: z.string().optional(),
  Company_Name: z.string().optional(),
  Supplier_Name: z.string().optional(),
  Facility_Name: z.string().optional(),
  Refinery_Name: z.string().optional(),
  Certification: z.string().optional(),
  Start_Date: z.string().optional(),
  End_Date: z.string().optional(),
  Time_Horizon: z.string().optional(),
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

const GeometrySchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(CoordinatesSchema),
});

export const geoJsonSchema = z.object({
  type: z.literal('Feature'),
  properties: PropertiesSchema,
  geometry: GeometrySchema,
});

export type GeoJsonSchema = z.infer<typeof geoJsonSchema>;
