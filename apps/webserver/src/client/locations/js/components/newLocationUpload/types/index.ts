export enum UploadType {
  ByFile,
  ByPoint,
  ByPolygon,
  ById,
}

export type MeasurementUnit = 'hectares' | 'kilometers';

export type UserList = {
  id: number;
  user_id: number;
  template_id: number;
  list_name: string;
  list_status_id: number;
  location_classification: string;
  listAnalysesStatus: {
    listId: number;
    analysisId: 'FCD' | 'AFI' | 'ALERTS';
    options?: string | null;
  }[];
};

export type Coordinate = { longitude: number; latitude: number };

export type Area = {
  size: number;
  measurementUnit: MeasurementUnit;
};

export type LocationListType = {
  type: string;
  properties: FeatureProperties;
};

export type PolygonFromMapPage = {
  geometry: { rings: number[][][] };
};

export type FeatureProperties = {
  Location_N?: string;
  locationName?: string;
  Latitude?: number;
  latitude?: string;
  Longitude?: number;
  longitude?: string;
  analysisRadius?: string;
  Analysis_R?: number;
  analysisArea?: string;
  Analysis_A?: number;
  commodity?: string;
  country?: string;
  state?: string;
  subState?: string;
};

export enum FileAttachState {
  NoFile,
  DragOver,
  Uploading,
  Uploaded,
  UnsupportedType,
  UploadFailed,
}
