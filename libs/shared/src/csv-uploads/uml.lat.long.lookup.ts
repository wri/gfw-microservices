import axios from 'axios';
import { Logger } from '@nestjs/common';
import { IdLookupFn } from '.';

const logger = new Logger('uml.lat.long.lookup');

const DATA_API_URL = `${process.env.GFW_DATASET_API_URL}/gfw_universal_mill_list/latest/query`;

/**
 * Validates if the provided ID is a non-empty alphanumeric string.
 * Eventually, we should find a pattern in the UML IDs to make this validation more robust.
 */
const isValidUmlIdString = (id: string) => {
  return typeof id === 'string' && /^[a-zA-Z0-9]+$/.test(id);
};

export const umlLookUp: IdLookupFn = async (ids) => {
  const result = {};

  // Separate invalid ID strings
  const formatValidatedIds: string[] = [];

  ids.forEach((id) => {
    if (!isValidUmlIdString(id)) {
      logger.error(`❌ Invalid UML ID format: ${id}`);
      result[id] = {
        errorDetails: [`UML LookUp: invalid string format for ID ${id}`],
      };
    } else {
      result[id] = {};
      formatValidatedIds.push(id);
    }
  });

  if (!formatValidatedIds.length) {
    logger.error('No valid UML IDs provided for lookup.');
    return result;
  }

  const sqlIds = formatValidatedIds.map((id) => `'${id}'`).join(',');

  try {
    const response = await axios.get(DATA_API_URL, {
      headers: {
        'x-api-key': process.env.GFW_DATA_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        sql: `select uml_id, latitude, longitude from data where uml_id in (${sqlIds})`,
      },
    });

    const umlRecords = response.data.data || [];

    umlRecords.forEach((found) => {
      if (formatValidatedIds.includes(found.uml_id)) {
        result[found.uml_id] = {
          latitude: found.latitude,
          longitude: found.longitude,
        };
      }
    });

    // Mark valid IDs not returned as "not found"
    formatValidatedIds.forEach((id) => {
      if (result[id].latitude === undefined || result[id].longitude === undefined) {
        result[id] = {
          errorDetails: [`UML LookUp: did not found lat/long for ${id}`],
        };
      }
    });
  } catch (error) {
    logger.error(`umlLookUp failed for ${sqlIds}`, error.stack || error);
    formatValidatedIds.forEach((id) => {
      result[id] = {
        errorDetails: [
          `${error.name}: ${error.message}`,
          `There was an error in the UML lat/long lookup for ${id}`,
        ],
      };
    });
  }

  return result;
};
