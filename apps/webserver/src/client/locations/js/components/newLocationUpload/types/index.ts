export enum UploadType {
  ByFile,
  ByPoint,
  ByPolygon,
}

export type MeasurementUnit = 'hectares' | 'kilometers';

export type ChangePageType = {
  setUploadType: (type: UploadType | null) => void;
};

type GeometryType = {
  type: string;
  coordinates: number[][][];
};

export type FeatureProperties = {
  Location_N: string;
  Analysis_A?: number;
  Analysis_R?: number;
  Certificat?: string;
  Company_ID?: string;
  Company_Na?: string;
  End_Date?: string;
  Facility_N?: string;
  Latitude?: number;
  Location_C?: string;
  Longitude?: number;
  Owner_ID?: string;
  Owner_Name?: string;
  Refinery_N?: string;
  Start_Date?: string;
  Supplier_N?: string;
  Time_Horiz?: string;
  Volume?: string;
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
};

export type LocationListType = {
  type: 'Feature';
  geometry: GeometryType;
  properties: FeatureProperties;
};

