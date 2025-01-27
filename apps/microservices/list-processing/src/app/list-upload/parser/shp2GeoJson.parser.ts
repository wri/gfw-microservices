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
    Location_C: 'locationClassification',
    Company_ID: 'companyID',
    Volume: 'volume',
    Owner_Name: 'ownerName',
    Owner_ID: 'ownerID',
    Company_Na: 'companyName',
    Supplier_N: 'supplierName',
    Facility_N: 'facilityName',
    Refinery_N: 'refineryName',
    Certificat: 'certification',
    Time_Horiz: 'timeHorizon',
    attribute1: 'attribute1',
    attribute2: 'attribute2',
    attribute3: 'attribute3',
    Start_Date: 'startDate',
    End_Date: 'endDate',
  };

  const newProperties = {};
  for (const [key, value] of Object.entries(feature.properties)) {
    newProperties[mapping[key]] = value;
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
