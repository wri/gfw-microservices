import { ConverterNamesList } from '@wri-monorepos/constants';

import { startConverterJob } from '../services/converters.service';
import logger from '../../../config/privateutils/logger.utils';

export const getConverters = (req, res) => {
  res.status(200).json({ converters: ConverterNamesList });
};

export const startConverter = async (req, res) => {
  const { converterName, organizationId = null } = req.body;

  if (!ConverterNamesList.includes(converterName)) {
    return res.status(400).json({ error: 'Invalid converter name' });
  }

  try {
    const id = await startConverterJob(converterName, organizationId);

    res.status(200).json({
      message: `Converter ${converterName} started successfully`,
      converterId: id,
    });
  } catch (err) {
    logger.error(`Failed to start converter ${converterName}:`, err.stack || err);
    res.status(500).json({ error: 'Failed to start converter' });
  }
};
