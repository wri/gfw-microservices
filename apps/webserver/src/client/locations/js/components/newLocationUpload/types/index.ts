import { UploadType } from '..';

export type MeasurementUnit = 'hectares' | 'kilometers';

export type ChangePageType = {
  setUploadType: (type: UploadType | null) => void;
};
