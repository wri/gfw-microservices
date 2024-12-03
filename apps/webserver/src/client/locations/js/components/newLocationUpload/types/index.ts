import { ActiveComponent } from '..';

export enum UploadType {
  ByFile,
  ByPoint,
  ByPolygon,
}

export type MeasurementUnit = 'hectares' | 'kilometers';

export type ChangePageType = {
  setActiveComponent: (type: ActiveComponent) => void;
};
