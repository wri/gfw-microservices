export const CONVERTER_NAMES = {
  ADD_LOCATION_ID_PRIMARY_KEY: 'Add Location ID Primary Key', // to "list-xxxxx" and "list-xxxxx-analysis" Tables
  UPGRADE_LIST_SCHEMA: 'Upgrade List Schema', // to Version 2
  DELETE_INVALID_LOCATION_LISTS: 'Delete Invalid Location Lists',
  DELETE_PARTLY_UPDATED_LISTS: 'Delete Partly Updated Lists', // Lists With Invalid Template/Commodity
  DELETE_MISSING_TABLE_LISTS: 'Delete Missing Tables Lists', // Lists With Missing "list-xxxxx" Table
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

export type RunMode = 'GLOBAL' | 'TARGETED' | 'CONTINUE';

export interface ConverterRunOptions {
  mode: RunMode;
  organizationId?: number;
  isDryRun?: boolean; // Optional, used for testing or dry runs
}
