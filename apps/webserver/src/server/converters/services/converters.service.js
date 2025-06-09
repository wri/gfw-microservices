import axios from 'axios';

import {
  ClientStoreConnection,
  ConverterStatus as ConverterStatusEntity,
} from '@wri-monorepos/sql';

import { ConverterStatus as ConverterStatusEnum } from '@wri-monorepos/constants';

import logger from '../../../config/privateutils/logger.utils';

export const startConverterJob = async (converterName, organizationId = null) => {
  const connection = await getDbConnection();
  const repo = connection.getRepository(ConverterStatusEntity);

  const insertedId = await insertConverterRecord(repo, converterName, organizationId);

  try {
    await triggerListProcessor(insertedId, organizationId);
  } catch (err) {
    logger.error(`Error triggering LP for converter ${insertedId}:`, err.stack || err);
    await markConverterFailed(repo, insertedId, err.message);
    throw new Error('Failed to trigger downstream converter process');
  }

  return insertedId;
};

/** Helper functions **/

const getDbConnection = async () => {
  const clientStoreConnection = new ClientStoreConnection();
  return clientStoreConnection.getConnection('gfwpro');
};

const insertConverterRecord = async (repo, name, organizationId = null) => {
  const result = await repo.insert({
    name,
    startTime: null,
    status: ConverterStatusEnum.PENDING,
    organizationId,
    listId: null,
    parentId: null,
    errorDetails: null,
  });

  const id = result.identifiers[0]?.id;
  if (!id) {
    throw new Error('Failed to retrieve inserted converter ID');
  }
  
  logger.info(`Inserted converter with ID: ${id}`);
  return id;
};

const triggerListProcessor = async (id, organizationId = null) => {
  const { LISTS_MICROSERVICE_URL } = process.env;
  await axios.post(`${LISTS_MICROSERVICE_URL}/converters/${id}/start`, {
    organizationId,
  });
};

const markConverterFailed = async (repo, id, message) => {
  await repo.update(id, {
    status: ConverterStatusEnum.FAILED,
    errorDetails: message || 'Unknown error',
  });
};
