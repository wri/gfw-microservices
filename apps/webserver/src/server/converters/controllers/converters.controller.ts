import { Request, Response } from 'express';

import { CONVERTER_NAMES } from '@wri-monorepos/constants';
import {
  startConverterJob,
  markConverterStopped,
  getConverterJobs,
  getConverterJobInfo,
} from '../services/converters.service';

import logger from '../../../config/privateutils/logger.utils';

interface StartConverterBody {
  converterName: string;
  organizationId?: number | null;
}

/**
 * @route GET /converter/all
 * @desc Returns a list of available converters
 * @access Pro Manager only
 */
export const getConverters = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    convertersNames: CONVERTER_NAMES,
    converterJobs: await getConverterJobs(),
  });
};

/**
 * @route POST /converter/start
 * @desc Starts a specific converter by name
 * @access Pro Manager only
 */
export const startConverter = async (
  req: Request<unknown, unknown, StartConverterBody>,
  res: Response
): Promise<void> => {
  const { converterName, organizationId = null } = req.body;

  if (!(converterName in CONVERTER_NAMES)) {
    res.status(400).json({ error: 'Invalid converter name' });
    return;
  }

  try {
    const id = await startConverterJob(converterName, organizationId);

    res.status(200).json({
      message: `Converter ${converterName} started successfully`,
      converterId: id,
    });
  } catch (err: any) {
    logger.error(`Failed to start converter ${converterName}:`, err.stack || err);
    res.status(500).json({ error: 'Failed to start converter' });
  }
};

/**
 * @route POST /converter/:id/stop
 * @param {number} id - The ID of the converter to stop
 * @desc Stops a specific converter by name
 * @access Pro Manager only
 */
export const stopConverter = async (req, res) => {
  const { id: converterId } = req.params;

  try {
    await markConverterStopped(Number(converterId));
    logger.info(`Stopped converter with ID: ${converterId}`);

    return res.status(200).json({
      message: `Converter ${converterId} stopped successfully`,
    });
  } catch (err) {
    logger.error(`Error stopping converter with ID ${converterId}:`, err);
    return res.status(500).json({
      error: 'Failed to stop converter',
    });
  }
};

export const getConverterInfo = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const parentId = parseInt(id, 10);
  if (isNaN(parentId)) {
    res.status(400).json({ error: 'Invalid converter ID' });
    return;
  }

  try {
    const converterInfo = await getConverterJobInfo(parentId);
    if (!converterInfo) {
      res.status(404).json({ error: `Converter with ID ${parentId} not found` });
      return;
    }
    res.status(200).json(converterInfo);
  } catch (err) {
    logger.error(`Failed to fetch converter info for ID ${id}:`, err);
    res.status(500).json({ error: err.message || 'Internal server error fetching converter info' });
  }
};
