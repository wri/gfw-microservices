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
      type: 'float' as ColumnType,
      name: 'Analysis Radius',
      nullable: true,
    },
    analysisArea: {
      type: 'float' as ColumnType,
      name: 'Analysis Area',
      nullable: true,
    },
    commodity: {
      type: 'varchar' as ColumnType,
      name: 'Commodity',
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
      nullable: false,
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
  locationName: string;
  latitude: number;
  longitude: number;
  analysisArea: number;
  analysisRadius: number;
  commodity: string;
  country: string;
  state: string;
  subState: string;
  gadmid: string;
  geometry: string;
  locationId: number;
  attributes: string;
  errorDetails: string;
};
