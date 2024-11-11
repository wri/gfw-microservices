import { UploadType } from '../index';

export type MeasurementUnit = 'hectares' | 'kilometers';

export type ChangePageType = {
  setUploadType: (type: UploadType | null) => void;
};
