import * as shapefile from 'shapefile';
import * as unzipper from 'unzipper';
import * as fs from 'fs';
import * as path from 'path';

import { promisify } from 'util';

const mkdtemp = promisify(fs.mkdtemp);

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
        resolve(geojson);
      })
      .catch((error) => {
        // Clean up extracted files in case of error
        files.forEach((file) => fs.unlinkSync(path.join(extractedFolder, file)));
        reject(error);
      });
  });
};
