export const CONVERTER_NAMES = {
  LIST_SCHEMA: 'List Schema',
  GADM_VERSION: 'GADM Version',
  UPGRADE_LIST_SCHEMA: 'Upgrade List Schema to Version 2',
  DELETE_INVALID_LOCATION_LISTS: 'Delete Invalid Location Lists',
  DELETE_INVALID_COMMODITY_TEMPLATE: 'Delete Lists With Invalid Commodity Or Template',
} as const;

export type ConverterName = (typeof CONVERTER_NAMES)[keyof typeof CONVERTER_NAMES];

export const ConverterNamesList: ConverterName[] = Object.values(CONVERTER_NAMES);

export enum ConverterStatus {
  PENDING = 'PENDING',
  STOPPED = 'STOPPED',
  COMPLETED = 'COMPLETED',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}
