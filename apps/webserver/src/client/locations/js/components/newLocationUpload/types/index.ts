export enum UploadType {
  ByFile,
  ByPoint,
  ByPolygon,
}

export type MeasurementUnit = 'hectares' | 'kilometers';

export type UserList = {
  id: number;
  user_id: number;
  template_id: number;
  list_name: string;
};
