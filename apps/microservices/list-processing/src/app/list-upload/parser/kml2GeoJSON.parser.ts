import { kml } from '@mapbox/togeojson';
import { DOMParser } from '@xmldom/xmldom';
import { Logger } from '@nestjs/common';

export const kml2GeoJSON = async (data: string) => {
  try {
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(data, 'text/xml');

    if (!kmlDoc.getElementsByTagName('kml').length) {
      throw new Error('Invalid KML: No <kml> tag found');
    }

    return kml(kmlDoc);
  } catch (e) {
    Logger.error(e);
    if (e instanceof Error && e.message === 'Invalid KML: No <kml> tag found') {
      throw e;
    }
    throw new Error('Error parsing KML to GeoJSON');
  }
};
