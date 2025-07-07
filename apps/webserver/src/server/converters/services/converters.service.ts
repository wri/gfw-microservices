import axios from 'axios';
import {
  ClientStoreConnection,
  ConverterStatus as ConverterStatusEntity,
} from '@wri-monorepos/sql';

import { ConverterStatus as ConverterStatusEnum, CONVERTER_NAMES } from '@wri-monorepos/constants';

import logger from '../../../config/privateutils/logger.utils';
import { Repository, InsertResult, UpdateResult, IsNull } from 'typeorm';

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

  // Start the long process asynchronously but don't await it
  triggerListProcessingConverter(insertedId, organizationId).catch(async (err) => {
    const errorMessage = err?.response?.data || err?.message || 'Unknown error';
    logger.error(`Error triggering LP for converter ${insertedId}:`, errorMessage);
    await markConverterFailed(repo, insertedId, errorMessage);
  });

  return insertedId; // Immediately return the ID after insert
};

export const markConverterStopped = async (converterId: number): Promise<void> => {
  const connection = await getDbConnection();
  const repo: Repository<ConverterStatusEntity> = connection.getRepository(ConverterStatusEntity);
  logger.info(`Marking converter ${converterId} as stopped`);

  try {
    await repo.update(converterId, {
      status: ConverterStatusEnum.STOPPED,
    });
  } catch (err: any) {
    logger.error(`Failed to mark converter ${converterId} as stopped:`, err.stack || err);
    throw new Error(`Failed to mark converter ${converterId} as stopped`);
  }
};

export const getConverterJobs = async (): Promise<ConverterStatusEntity[]> => {
  const connection = await getDbConnection();
  const repo: Repository<ConverterStatusEntity> = connection.getRepository(ConverterStatusEntity);
  logger.info('Fetching all converter jobs');

  // Limiting the number of jobs returned to 50 & only fetching top-level (parent) jobs.
  try {
    return await repo.find({
      take: 50, // Limit the number of jobs returned
      order: {
        startTime: 'DESC',
      },
      where: {
        parentId: IsNull(), // Only top-level jobs
      },
    });
  } catch (err: any) {
    logger.error('Failed to fetch converter jobs:', err.stack || err);
    throw new Error('Failed to fetch converter jobs');
  }
};

export const getConverterJobInfo = async (parentId: number) => {
  const connection = await getDbConnection();
  const repo: Repository<ConverterStatusEntity> = connection.getRepository(ConverterStatusEntity);

  let parentConverter: ConverterStatusEntity | null = null;
  let childrenConverters: ConverterStatusEntity[] = [];

  try {
    parentConverter = await repo.findOne({
      where: { id: parentId },
    });

    childrenConverters = await repo.find({
      where: { parentId },
      order: { id: 'DESC' },
    });
  } catch (err: any) {
    logger.error(`Error fetching converter info for ID ${parentId}:`, err.stack || err);
    throw new Error('Failed to fetch converter info');
  }

  return {
    ...parentConverter,
    name: CONVERTER_NAMES[parentConverter.name],
    children: childrenConverters,
  };
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
