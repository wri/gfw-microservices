import { ColumnType } from 'typeorm';

export const ListSchema = {
  name: 'list-xxxxx',
  columns: {
    locationName: {
      type: 'varchar' as ColumnType,
      name: 'Location Name',
    },
    latitude: {
      type: 'float' as ColumnType,
      name: 'Latitude',
    },
    longitude: {
      type: 'float' as ColumnType,
      name: 'Longitude',
    },
    analysisRadius: {
      type: 'int' as ColumnType,
      name: 'Analysis Radius',
      nullable: true,
    },
    analysisArea: {
      type: 'int' as ColumnType,
      name: 'Analysis Area',
      nullable: true,
    },
    commodity: {
      type: 'varchar' as ColumnType,
      name: 'Commodity',
    },
    locationClassification: {
      type: 'varchar' as ColumnType,
      name: 'Location Classification',
      nullable: true,
    },
    companyID: {
      type: 'varchar' as ColumnType,
      name: 'Company ID',
      nullable: true,
    },
    volume: {
      type: 'varchar' as ColumnType,
      name: 'Volume',
      nullable: true,
    },
    ownerName: {
      type: 'varchar' as ColumnType,
      name: 'Owner Name',
      nullable: true,
    },
    ownerID: {
      type: 'varchar' as ColumnType,
      name: 'Owner ID',
      nullable: true,
    },
    companyName: {
      type: 'varchar' as ColumnType,
      name: 'Company Name',
      nullable: true,
    },
    supplierName: {
      type: 'varchar' as ColumnType,
      name: 'Supplier Name',
      nullable: true,
    },
    refineryName: {
      type: 'varchar' as ColumnType,
      name: 'Refinery Name',
      nullable: true,
    },
    certification: {
      type: 'varchar' as ColumnType,
      name: 'Certification',
      nullable: true,
    },
    startDate: {
      type: 'varchar' as ColumnType,
      name: 'Start Date',
      nullable: true,
    },
    endDate: {
      type: 'varchar' as ColumnType,
      name: 'End Date',
      nullable: true,
    },
    timeHorizon: {
      type: 'varchar' as ColumnType,
      name: 'Time Horizon',
      nullable: true,
    },
    accuracyRatingLocationEntered: {
      type: 'int' as ColumnType,
      name: 'Accuracy Rating of Location Entered',
      nullable: true,
    },
    country: {
      type: 'varchar' as ColumnType,
      name: 'Country',
      nullable: true,
    },
    state: {
      type: 'varchar' as ColumnType,
      name: 'State',
      nullable: true,
    },
    subState: {
      type: 'varchar' as ColumnType,
      name: 'Sub State',
      nullable: true,
    },
    windBarrier: {
      type: 'varchar' as ColumnType,
      name: 'Wind Barrier',
      nullable: true,
    },
    riparianBuffers: {
      type: 'varchar' as ColumnType,
      name: 'Riparian Buffers',
      nullable: true,
    },
    bufferZones: {
      type: 'varchar' as ColumnType,
      name: 'Buffer Zones',
      nullable: true,
    },
    gadmid: {
      type: 'varchar' as ColumnType,
      name: 'gadmid',
      nullable: true,
    },
    geometry: {
      type: 'varchar' as ColumnType,
      name: 'Geometry',
      nullable: true,
    },
    locationId: {
      type: 'int' as ColumnType,
      primary: true,
      name: 'location_id',
      nullable: true,
    },
    flagGeneral: {
      type: 'int' as ColumnType,
      name: 'flag_general',
      nullable: true,
    },
    flagGranChaco: {
      type: 'int' as ColumnType,
      name: 'flag_gran_chaco',
      nullable: true,
    },
    flagGlad: {
      type: 'int' as ColumnType,
      name: 'flag_glad',
      nullable: true,
    },
    flagForma: {
      type: 'int' as ColumnType,
      name: 'flag_forma',
      nullable: true,
    },
    flagViirs: {
      type: 'int' as ColumnType,
      name: 'flag_viirs',
      nullable: true,
    },
    flagTerrai: {
      type: 'int' as ColumnType,
      name: 'flag_terrai',
      nullable: true,
    },
    attributes: {
      type: 'varchar' as ColumnType,
      name: 'attributes',
    },
    errorDetails: {
      type: 'varchar' as ColumnType,
      name: 'ErrorDetails',
      nullable: true,
    },
  },
};

export type ListSchemaType = {
  accuracyRatingLocationEntered: number;
  analysisArea: number;
  analysisRadius: number;
  bufferZones: string;
  certification: string;
  commodity: string;
  companyID: string;
  companyName: string;
  country: string;
  endDate: string;
  facilityName: string;
  flagForma: number;
  flagGeneral: number;
  flagGlad: number;
  flagGranChaco: number;
  flagTerrai: number;
  flagViirs: number;
  gadmid: string;
  geometry: string;
  latitude: number;
  locationClassification: string;
  locationId: number;
  locationName: string;
  longitude: number;
  ownerID: string;
  ownerName: string;
  refineryName: string;
  riparianBuffers: string;
  startDate: string;
  state: string;
  subState: string;
  supplierName: string;
  timeHorizon: string;
  volume: string;
  attributes: string;
  windBarrier: string;
  errorDetails: string;
};
