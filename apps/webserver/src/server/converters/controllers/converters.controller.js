import axios from 'axios';

import {
  ClientStoreConnection,
  ConverterStatus as ConverterStatusEntity,
} from '@wri-monorepos/sql';
import {
  ConverterStatus as ConverterStatusEnum,
  ConverterNamesList,
} from '@wri-monorepos/constants';

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
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection('gfwpro');
    const converterStatusRepo = connection.getRepository(ConverterStatusEntity);

    const insertResult = await converterStatusRepo.insert({
      name: converterName,
      startTime: null,
      status: ConverterStatusEnum.PENDING,
      organizationId,
      listId: null,
      parentId: null,
      errorDetails: null,
    });

    const insertedId = insertResult.identifiers[0]?.id;

    if (!insertedId) {
      throw new Error('Failed to retrieve inserted converter ID');
    }

    logger.info(`Inserted converter with ID: ${insertedId}`);

    const { LISTS_MICROSERVICE_URL } = process.env;

    try {
      const response = await axios.post(
        `${LISTS_MICROSERVICE_URL}/converters/${insertedId}/start`,
        { organizationId }
      );

      logger.info('SaveListToProcess LP response.data', response.data);
      res.status(200).json({
        message: `Converter ${converterName} started successfully`,
        converterId: insertedId,
      });
    } catch (err) {
      logger.error(`Error calling LP for converter ${insertedId}`, err);
      res.status(502).json({ error: 'Failed to trigger downstream converter process' });
    }
  } catch (error) {
    console.error(`Error starting converter ${converterName}:`, error);
    res.status(500).json({ error: 'Failed to start converter' });
  }
};
