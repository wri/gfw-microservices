import { readAnalysesLastModifiedTime } from '@wri-monorepos/shared';
import { S3Service } from '@wri-monorepos/aws';
const logger = require('../../../config/privateutils/logger.utils');

export const getAnalysesLastModifiedTime = async (req, res) => {
  const s3 = new S3Service();
  try {
    const data = await readAnalysesLastModifiedTime(s3);
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching last modified times:', error.stack || error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
