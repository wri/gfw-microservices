import { Request, Response } from 'express';

import { CONVERTER_NAMES, RunMode } from '@wri-monorepos/constants';

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
  mode: RunMode;
  isDryRun?: boolean;
}

/**
 * @route GET /converter/all
 * @desc Returns a list of available converters
 * @access Pro Manager only
 */
export const getConverters = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Fetching all available converters');
    res.status(200).json({
      convertersNames: CONVERTER_NAMES,
      converterJobs: await getConverterJobs(),
    });
  } catch (err) {
    logger.error('Failed to fetch converters:', err);
    res.status(500).json({ error: 'Failed to fetch converters' });
  }
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
  const { converterName, organizationId = null, mode, isDryRun } = req.body;

  if (!(converterName in CONVERTER_NAMES)) {
    res.status(400).json({ error: 'Invalid converter name' });
    return;
  }

  try {
    const converterJobId = await startConverterJob(converterName, {
      organizationId,
      mode,
      isDryRun,
    });
    const userId = req.session?.user_id ?? -1;
    logger.info(`Converter ${converterName} started by user ID: ${userId}`);

    res.status(200).json({
      // Return success immediately without waiting for processing
      message: `Converter ${converterName} started successfully`,
      converterId: converterJobId,
      status: 'RUNNNING',
    });
    logger.info(`Started converter '${converterName}' with ID: ${converterJobId}`);
  } catch (err: any) {
    const errorMessage = `Failed to start converter '${converterName}': ${
      err?.message || err?.stack || String(err) || 'Unknown error'
    }`;
    logger.error(errorMessage);
    res.status(500).json({ error: errorMessage });
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
    logger.info(`Stopped converter job with ID: ${converterId}`);

    return res.status(200).json({
      message: `Converter job ID ${converterId} stopped successfully`,
    });
  } catch (err) {
    const errorMessage = `Error stopping converter job with ID ${converterId}': ${
      err?.message || err?.stack || String(err) || 'Unknown error'
    }`;
    logger.error(errorMessage);
    return res.status(500).json({ error: errorMessage });
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
