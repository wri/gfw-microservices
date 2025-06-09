import { Request, Response } from 'express';

import {
  ClientStoreConnection,
  ConverterStatus as ConverterStatusEntity,
} from '@wri-monorepos/sql';
import { ConverterStatus as ConverterStatusEnum } from '@wri-monorepos/constants';

import { ConverterNamesList, ConverterName } from '@wri-monorepos/constants';
import { startConverterJob } from '../services/converters.service';
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
export const getConverters = (req: Request, res: Response): void => {
  res.status(200).json({ converters: ConverterNamesList });
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

  if (!ConverterNamesList.includes(converterName as ConverterName)) {
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
 * @route POST /converter/start
 * @desc Starts a specific converter by name
 * @access Pro Manager only
 */
export const stopConverter = async (req, res) => { 
  const { id: converterId } = req.params;

  try {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection('gfwpro');
    const converterStatusRepo = connection.getRepository(ConverterStatusEntity);

    await converterStatusRepo.update(converterId, {
      status: ConverterStatusEnum.STOPPED,
    });

    logger.info(`Inserted converter with ID: ${converterId}`);
  } catch (err) {
    logger.error(`Error stopping converter with ID ${converterId}:`, err);
    throw new Error('Failed to retrieve inserted converter ID');
  }
};
