export const ListSchema = {
  name: 'list-xxxxx',
  columns: {
    locationName: {
      type: String,
      name: 'Location Name',
    },
    latitude: {
      type: Number,
      name: 'Latitude',
    },
    longitude: {
      type: Number,
      name: 'Longitude',
    },
    analysisRadius: {
      type: Number,
      name: 'Analysis Radius',
      nullable: true,
    },
    analysisArea: {
      type: Number,
      name: 'Analysis Area',
      nullable: true,
    },
    commodity: {
      type: String,
      name: 'Commodity',
    },
    locationClassification: {
      type: String,
      name: 'Location Classification',
      nullable: true,
    },
    companyID: {
      type: String,
      name: 'Company ID',
      nullable: true,
    },
    volume: {
      type: String,
      name: 'Volume',
      nullable: true,
    },
    ownerName: {
      type: String,
      name: 'Owner Name',
      nullable: true,
    },
    ownerID: {
      type: String,
      name: 'Owner ID',
      nullable: true,
    },
    companyName: {
      type: String,
      name: 'Company Name',
      nullable: true,
    },
    supplierName: {
      type: String,
      name: 'Supplier Name',
      nullable: true,
    },
    refineryName: {
      type: String,
      name: 'Refinery Name',
      nullable: true,
    },
    certification: {
      type: String,
      name: 'Certification',
      nullable: true,
    },
    startDate: {
      type: String,
      name: 'Start Date',
      nullable: true,
    },
    endDate: {
      type: String,
      name: 'End Date',
      nullable: true,
    },
    timeHorizon: {
      type: String,
      name: 'Time Horizon',
      nullable: true,
    },
    accuracyRatingLocationEntered: {
      type: Number,
      name: 'Accuracy Rating of Location Entered',
      nullable: true,
    },
    country: {
      type: String,
      name: 'Country',
      nullable: true,
    },
    state: {
      type: String,
      name: 'State',
      nullable: true,
    },
    subState: {
      type: Number,
      name: 'Sub State',
      nullable: true,
    },
    windBarrier: {
      type: String,
      name: 'Wind Barrier',
      nullable: true,
    },
    riparianBuffers: {
      type: String,
      name: 'Riparian Buffers',
      nullable: true,
    },
    bufferZones: {
      type: String,
      name: 'Buffer Zones',
      nullable: true,
    },
    gadmid: {
      type: String,
      name: 'gadmid',
      nullable: true,
    },
    geometry: {
      type: String,
      name: 'Geometry',
      nullable: true,
    },
    locationId: {
      type: Number,
      primary: true,
      name: 'location_id',
      nullable: true,
    },
    flagGeneral: {
      type: Number,
      name: 'flag_general',
      nullable: true,
    },
    flagGranChaco: {
      type: Number,
      name: 'flag_gran_chaco',
      nullable: true,
    },
    flagGlad: {
      type: Number,
      name: 'flag_glad',
      nullable: true,
    },
    flagForma: {
      type: Number,
      name: 'flag_forma',
      nullable: true,
    },
    flagViirs: {
      type: Number,
      name: 'flag_viirs',
      nullable: true,
    },
    flagTerrai: {
      type: Number,
      name: 'flag_terrai',
      nullable: true,
    },
    errorDetails: {
      type: String,
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
  windBarrier: string;
  errorDetails: string;
};
