import * as shapefile from 'shapefile';
import * as unzipper from 'unzipper';
import * as fs from 'fs';
import * as path from 'path';

import { promisify } from 'util';

const mkdtemp = promisify(fs.mkdtemp);

export const convertProperties = (feature) => {
  const mapping = {
    Location_N: 'locationName',
    Latitude: 'latitude',
    Longitude: 'longitude',
    Analysis_R: 'analysisRadius',
    Analysis_A: 'analysisArea',
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
    Time_Horiz: 'Time Horizon',
    Start_Date: 'Start Date',
    End_Date: 'End Date',
  };

  const newProperties = {};
  for (const [key, value] of Object.entries(feature.properties)) {
    const newKey = mapping[key] || key;
    newProperties[newKey] = value;
  }

  return {
    ...feature,
    properties: newProperties,
  };
};

export const convertShapefileToGeoJSON = async (zipFilePath: string): Promise<any> => {
  const extractedFolder =
    process.env.NODE_ENV !== 'test'
      ? await mkdtemp(path.join('/tmp/', 'shapefile-'))
      : '/tmp/shapefile';

  // Unzip the file
  await fs
    .createReadStream(zipFilePath)
    .pipe(unzipper.Extract({ path: extractedFolder }))
    .promise();

  // Find the .shp file in the extracted folder
  const files = fs.readdirSync(extractedFolder);
  const shpFile = files.find((file) => path.extname(file) === '.shp');
  if (!shpFile) {
    throw new Error('Shapefile (.shp) not found in the zip archive');
  }

  const shpFilePath = path.join(extractedFolder, shpFile);

  // Convert the shapefile to GeoJSON
  return new Promise((resolve, reject) => {
    shapefile
      .read(shpFilePath)
      .then((geojson) => {
        // Clean up extracted files
        files.forEach((file) => fs.unlinkSync(path.join(extractedFolder, file)));

        geojson.features = geojson.features.map((feature) => convertProperties(feature));

        resolve(geojson);
      })
      .catch((error) => {
        // Clean up extracted files in case of error
        files.forEach((file) => fs.unlinkSync(path.join(extractedFolder, file)));
        reject(error);
      });
  });
};
