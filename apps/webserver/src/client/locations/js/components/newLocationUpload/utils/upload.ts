import axios from 'axios';
import { LocationListType, FeatureProperties } from '../types';

export type PresignedUrl = {
  url: string;
  keyFile: string;
  fileS3Route: string;
};

type FileTypes = {
  csv: string;
  geojson: string;
  json: string;
  kml: string;
  kmz: string;
  xls: string;
  xlsx: string;
  zip: string;
};

const fileExtensions: FileTypes = {
  csv: 'text/csv',
  geojson: 'application/geojson',
  json: 'application/json',
  kml: 'application/vnd.google-earth.kml+xml',
  kmz: 'application/vnd.google-earth.kmz',
  xls: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
};
function getFileType(extension: string): string | undefined {
  if (extension in fileExtensions) {
    return fileExtensions[extension as keyof FileTypes];
  }
  return undefined;
}

export const uploadFileToS3 = async (file: File): Promise<PresignedUrl> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const { data } = await axios.post<PresignedUrl>('/locations/create-presigned-url', {
    key: file.name,
    contentType: getFileType(fileExtension),
  });
  await axios.put(data.url, file, {
    headers: {
      'Content-Type': getFileType(fileExtension),
    },
  });
  return data;
};

export const getTableColumns = (templateData?: LocationListType[]) => {
  if (!templateData?.length) {
    return [];
  }

  const firstItemProperties = templateData[0]?.properties;
  if (!firstItemProperties) {
    return [];
  }

  return Object.keys(firstItemProperties).filter(
    (key) => key in LabelNameTable
  ) as (keyof typeof LabelNameTable)[];
};

export const LabelNameTable: {
  [key in keyof FeatureProperties]: string;
} = {
  Location_N: 'Location Name',
  locationName: 'Location Name',
  investmentName: 'Investment Name',
  mill_name: 'Mill Name',
  latitude: 'Latitude',
  Latitude: 'Latitude',
  Longitude: 'Longitude',
  longitude: 'Longitude',
  analysisRadius: 'Analysis Radius',
  Analysis_R: 'Analysis Radius',
  analysisArea: 'Analysis Area',
  Analysis_A: 'Analysis Area',
  Location_C: 'Location Classification',
  commodity: 'Commodity',
  riskLevel: 'Risk Level',
  Volume: 'Volume',
  Owner_Name: 'Owner Name',
  Owner_ID: 'Owner ID',
  Company_ID: 'Company ID',
  companyName: 'Company Name',
  Company_Na: 'Company Name',
  Supplier_N: 'Supplier Name',
  Facility_N: 'Facility Name',
  Refinery_N: 'Refinery Name',
  certification: 'Certification',
  Certificat: 'Certification',
  startDate: 'Start Date',
  Start_Date: 'Start Date',
  endDate: 'End Date',
  End_Date: 'End Date',
  timeHorizon: 'Time Horizon',
  Time_Horiz: 'Time Horizon',
  country: 'Country',
  state: 'State',
  substate: 'Substate',
  parentCompanyOrGroup: 'Parent Company',
  companyPolicyRanking: 'Company Policy Ranking',
  typeOfInvestment: 'Type Of Investment',
  locationClassification: 'Location Classification',
  refineryName: 'Refinery',
  supplierName: 'Supplier',
  facilityName: 'Facility',
  attribute1: 'Attribute 1',
  attribute2: 'Attribute 2',
  attribute3: 'Attribute 3',
};

export const LabelNameTableZip = {
  locationName: 'Location_N',
  analysisRadius: 'Analysis_R',
  analysisArea: 'Analysis_A',
  locationClassification: 'Location_C',
  companyName: 'Company_Na',
  supplierName: 'Supplier_N',
  facilityName: 'Facility_N',
  refineryName: 'Refinery_N',
};
