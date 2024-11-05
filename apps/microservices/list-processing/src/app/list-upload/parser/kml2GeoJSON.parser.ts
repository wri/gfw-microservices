import { KmlToGeojson } from 'kml-to-geojson';
import { Logger } from '@nestjs/common';

export const kml2GeoJSON = async (data: string) => {
  const kmlToGeojson = new KmlToGeojson();
  try {
    const { geojson } = kmlToGeojson.parse(data);
    return geojson;
  } catch (e) {
    Logger.error(e);
    if (
      e instanceof Error &&
      e.message === "Cannot read properties of null (reading 'getElementsByTagName')"
    ) {
      throw new Error('Invalid KML: No <kml> tag found');
    }
    throw new Error('Error parsing KML to GeoJSON');
  }
};
