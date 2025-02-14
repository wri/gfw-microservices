export enum UploadType {
  ByFile,
  ByPoint,
  ByPolygon,
}

export type MeasurementUnit = 'hectares' | 'kilometers';

export type Coordinate = { longitude: number; latitude: number };

export type Area = {
  size: number;
  measurementUnit: MeasurementUnit;
};

export type LocationListType = {
  type: string;
  properties: FeatureProperties;
};

export type GeoFromMap = {
  locationName: string;
  geometry: { rings: number[][][] };
};

export type FeatureProperties = {
  Location_N?: string;
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
  investmentName?: string;
  mill_name?: string;
  latitude?: string;
  longitude?: string;
  analysisRadius?: string;
  analysisArea?: string;
  commodity?: string;
  riskLevel?: string;
  certification?: string;
  startDate?: string;
  endDate?: string;
  timeHorizon?: string;
  country?: string;
  state?: string;
  substate?: string;
  parentCompanyOrGroup?: string;
  companyPolicyRanking?: string;
  typeOfInvestment?: string;
  locationName?: string;
  companyName?: string;
  locationClassification?: string;
  refineryName?: string;
  supplierName?: string;
  facilityName?: string;
};

export enum FileAttachState {
  NoFile,
  DragOver,
  Uploading,
  Uploaded,
  UnsupportedType,
  UploadFailed,
}
