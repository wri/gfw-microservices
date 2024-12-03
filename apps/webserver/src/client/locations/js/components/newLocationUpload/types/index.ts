import { ActiveComponent } from '..';

export enum UploadType {
  ByFile,
  ByPoint,
  ByPolygon,
}

export type MeasurementUnit = 'hectares' | 'kilometers';

export type ChangePageType = {
  setUploadType: (type: UploadType | null) => void;
  setActiveComponent: (type: ActiveComponent) => void;
};
