import axios from 'axios';
import { Logger } from '@nestjs/common';

const logger = new Logger('read.last.updated.date.sicar');

const DATA_API_URL = `${process.env.GFW_DATASET_API_URL}/sfb_bra_sicar/v202401/metadata`;

export type LastUpdatedDateSicarResponse = {
  idDataUpdated?: string;
  error?: string;
};
export const readLastUpdatedDateSicar = async (): Promise<LastUpdatedDateSicarResponse> => {
  const result = {};
  try {
    const response = await axios.get(DATA_API_URL, {
      headers: {
        'x-api-key': process.env.GFW_DATA_API_KEY,
        'Content-Type': 'application/json',
      }
    });

    if (response.data.status === 'success' && response.data.data) {
      const lastUpdated = response.data.data.content_date_range.end_date;
      result['idDataUpdated'] = lastUpdated;
    } else {
      logger.error('Failed to retrieve last updated date from SICAR metadata');
      result['error'] = 'Failed to retrieve last updated date from SICAR metadata';
    }
  } catch (error) {
    logger.error(`readLastUpdatedDateSicar failed`, error.stack || error);
    result['error'] = `${error.name}: ${error.message}`;
  }

  return result;
};
