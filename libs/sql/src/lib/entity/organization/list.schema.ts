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
    },
    analysisArea: {
      type: Number,
      name: 'Analysis Area',
    },
    commodity: {
      type: String,
      name: 'Commodity',
    },
    locationClassification: {
      type: String,
      name: 'Location Classification',
    },
    companyID: {
      type: String,
      name: 'Company ID',
    },
    volume: {
      type: String,
      name: 'Volume',
    },
    ownerName: {
      type: String,
      name: 'Owner Name',
    },
    ownerID: {
      type: String,
      name: 'Owner ID',
    },
    companyName: {
      type: String,
      name: 'Company Name',
    },
    supplierName: {
      type: String,
      name: 'Supplier Name',
    },
    refineryName: {
      type: String,
      name: 'Refinery Name',
    },
    certification: {
      type: String,
      name: 'Certification',
    },
    startDate: {
      type: String,
      name: 'Start Date',
    },
    endDate: {
      type: String,
      name: 'End Date',
    },
    timeHorizon: {
      type: String,
      name: 'Time Horizon',
    },
    accuracyRatingLocationEntered: {
      type: Number,
      name: 'Accuracy Rating of Location Entered',
    },
    country: {
      type: String,
      name: 'Country',
    },
    state: {
      type: String,
      name: 'State',
    },
    subState: {
      type: Number,
      name: 'Sub State',
    },
    windBarrier: {
      type: String,
      name: 'Wind Barrier',
    },
    riparianBuffers: {
      type: String,
      name: 'Riparian Buffers',
    },
    bufferZones: {
      type: String,
      name: 'Buffer Zones',
    },
    gadmid: {
      type: String,
      name: 'gadmid',
    },
    geometry: {
      type: String,
      name: 'Geometry',
    },
    locationId: {
      type: Number,
      primary: true,
      name: 'location_id',
    },
    flagGeneral: {
      type: Number,
      name: 'flag_general',
    },
    flagGranChaco: {
      type: Number,
      name: 'flag_gran_chaco',
    },
    flagGlad: {
      type: Number,
      name: 'flag_glad',
    },
    flagForma: {
      type: Number,
      name: 'flag_forma',
    },
    flagViirs: {
      type: Number,
      name: 'flag_viirs',
    },
    flagTerrai: {
      type: Number,
      name: 'flag_terrai',
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
};
