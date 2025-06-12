import axios from 'axios';
import {
  ClientStoreConnection,
  ConverterStatus as ConverterStatusEntity,
} from '@wri-monorepos/sql';

import { ConverterStatus as ConverterStatusEnum } from '@wri-monorepos/constants';

import logger from '../../../config/privateutils/logger.utils';
import { Repository, InsertResult, UpdateResult } from 'typeorm';

interface InsertConverterParams {
  name: string;
  organizationId?: number | null;
}

export const startConverterJob = async (
  converterName: string,
  organizationId: number | null = null
): Promise<number> => {
  const connection = await getDbConnection();
  const repo: Repository<ConverterStatusEntity> = connection.getRepository(ConverterStatusEntity);

  const insertedId = await insertConverter(repo, { name: converterName, organizationId });

  try {
    await triggerListProcessingConverter(insertedId, organizationId);
  } catch (err: any) {
    const errorMessage = err?.response?.data || err?.message || 'Unknown error';

    logger.error(`Error triggering LP for converter ${insertedId}:`, errorMessage);

    await markConverterFailed(repo, insertedId, errorMessage);
    throw new Error('Failed to trigger list proc. converter process');
  }

  return insertedId;
};

/** Helper functions **/

const getDbConnection = async () => {
  const clientStoreConnection = new ClientStoreConnection();
  return clientStoreConnection.getConnection('gfwpro');
};

const insertConverter = async (
  repo: Repository<ConverterStatusEntity>,
  params: InsertConverterParams
): Promise<number> => {
  const { name, organizationId = null } = params;

  const result: InsertResult = await repo.insert({
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

const triggerListProcessingConverter = async (
  id: number,
  organizationId: number | null = null
): Promise<void> => {
  const { LISTS_MICROSERVICE_URL } = process.env;
  if (!LISTS_MICROSERVICE_URL) {
    throw new Error('LISTS_MICROSERVICE_URL environment variable not set');
  }
  await axios.post(`${LISTS_MICROSERVICE_URL}/converters/${id}/start`, {
    organizationId,
  });
};

const markConverterFailed = async (
  repo: Repository<ConverterStatusEntity>,
  id: number,
  message: string
): Promise<UpdateResult> => {
  return repo.update(id, {
    status: ConverterStatusEnum.FAILED,
    errorDetails: message || 'Unknown error',
  });
};
