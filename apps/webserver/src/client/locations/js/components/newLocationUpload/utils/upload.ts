import axios from 'axios';
import { LocationListType } from '../types';

export const getLocationListFromFile = (file: File) => {
  return new Promise((resolve, reject) => {
    try {
      createPresignedUrlFile(file).then((data) => {
        uploadFileToS3(file, data.url).then(() => {
          getPreviewList(data.keyFile).then((data) => {
            resolve(data);
          });
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const createPresignedUrlFile = async (file: File) => {
  try {
    const { data } = await axios.post('/locations/create-presigned-url', {
      key: file.name,
      contentType: file.type,
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

function uploadFileToS3(file: File, url: string | URL) {
  const xhr = new XMLHttpRequest();
  return new Promise((resolve) => {
    xhr.addEventListener('loadend', () => {
      resolve(xhr.readyState === 4 && xhr.status === 200);
    });

    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

export const getPreviewList = async (path: string) => {
  const config = {
    method: 'GET',
    url: '/api/list/preview',
    params: {
      path,
    },
  };

  return axios(config).then((response) => {
    return response.data?.features;
  });
};

export const getTableColumns = (templateData: LocationListType[] | null) => {
  if (!Array.isArray(templateData) || templateData.length === 0) {
    return [];
  }

  const availableKeys = Object.keys(templateData[0].properties);
  return availableKeys.filter((key) => key in LabelNameTable);
};

export const LabelNameTable = {
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
  volume: 'Volume',
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
