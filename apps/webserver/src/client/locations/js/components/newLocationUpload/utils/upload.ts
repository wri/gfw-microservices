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

  const filteredKeys = Object.keys(firstItemProperties).filter(
    (key) => !blackListedFields.includes(key)
  );

  // Remove duplicates by converting to lowercase for comparison
  const uniqueKeys: string[] = [];
  const seenLowerCase = new Set<string>();

  filteredKeys.forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (!seenLowerCase.has(lowerKey)) {
      seenLowerCase.add(lowerKey);
      uniqueKeys.push(key);
    }
  });

  // Remove "subState" from the final array
  const finalKeys = uniqueKeys.filter((key) => key !== 'subState');

  return finalKeys as (keyof typeof LabelNameTable)[];
};

export const LabelNameTable: {
  [key in keyof FeatureProperties]: string;
} = {
  Location_N: 'Location Name',
  locationName: 'Location Name',
  Latitude: 'Latitude',
  latitude: 'Latitude',
  Longitude: 'Longitude',
  longitude: 'Longitude',
  analysisRadius: 'Analysis Radius',
  Analysis_R: 'Analysis Radius',
  analysisArea: 'Analysis Area',
  Analysis_A: 'Analysis Area',
  commodity: 'Commodity',
  country: 'Country',
  state: 'State',
  subState: 'Substate',
};

export const LabelNameTableIdType = {
  IDType: 'ID Type',
  LocationName: 'Location Name',
  ID: 'ID',
  'AnalysisRadius|AnalysisArea': 'Analysis Radius or Analysis Area',
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

const blackListedFields = ['gadmid'];
