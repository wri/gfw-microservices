import Papa from 'papaparse';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { convertURL } from '../../../../../common/js/config';
import { KMLLoader } from '@loaders.gl/kml';
import { load } from '@loaders.gl/core';
import { LocationListType } from '../types';

export const convertCSVtoJson = (file: File) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        resolve(results.data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

export const convertZIPtoJson = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios
  .post(convertURL, formData)
  .then((response) => {
    return response.data?.data?.attributes?.features;
  });
}

export const convertXlsxToJson = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('File read error'));
        return;
      }

      const data: Uint8Array = new Uint8Array(event.target.result as ArrayBuffer);
      const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
      const sheetName: string = workbook.SheetNames[0];

      const sheet: XLSX.WorkSheet | undefined = workbook.Sheets[sheetName];
      if (!sheet) {
        reject(new Error('No sheet found in workbook'));
        return;
      }
      const jsonData: LocationListType[] = XLSX.utils.sheet_to_json(sheet);
      resolve(jsonData);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export const convertKMZAndKMLToJson = (file: File) => {
  return new Promise((resolve, reject) => {
    try {
      load(file, KMLLoader).then((data) => {
        resolve(data.features);
      })     
    } catch (error) {
      reject(error)
    }
  });
}

export const getLocationListFromFile = (file: File) => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension) {
      reject(new Error('File does not have a valid extension.'));
      return;
    }

    switch (fileExtension) {
      case 'csv':
        convertCSVtoJson(file)
          .then(resolve)
          .catch(reject);
        break;
      case 'zip':
        convertZIPtoJson(file)
          .then(resolve)
          .catch(reject);
        break;
      case 'xlsx':
        convertXlsxToJson(file)
          .then(resolve)
          .catch(reject);
        break;
      case 'kml':
      case 'kmz':
        convertKMZAndKMLToJson(file)
          .then(resolve)
          .catch(reject);
        break;
      default:
        reject(new Error('Unsupported file type.'));
    }
  });
}

export const LabelNameTable = {
  Location_N: 'Location Name',
  Latitude: 'Latitude',
  Longitude: 'Longitude',
  Analysis_R: 'Analysis Radius',
  Analysis_A: 'Analysis Area',
  Location_C: 'Location Classification',
  Company_ID: 'Company ID',
  Volume: 'Volume',
  Owner_Name: 'Owner Name',
  Owner_ID: 'Owner ID',
  Company_Na: 'Company Name',
  Supplier_N: 'Supplier Name',
  Facility_N: 'Facility Name',
  Refinery_N: 'Refinery Name',
  Certificat: 'Certification',
  Start_Date: 'Start Date',
  End_Date: 'End Date',
  Time_Horiz: 'Time Horizon',
} 