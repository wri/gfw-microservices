import { ClientStoreConnection, ListsUploadStatus } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import axios from 'axios';

interface MetadataServiceType {
  TaskARN: string;
}

export const updateListsUploadStatus = async (
  clientStore: string,
  listId: number,
  lastSuccessfulStage: string,
  errorInfo?: string
): Promise<void> => {
  const logger = new Logger('updateListsUploadStatus');
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(clientStore);
  const repository = connection.getRepository(ListsUploadStatus);
  const { taskARN } = await getMetadata();

  try {
    let record = await repository.findOne({ where: { listId, lastSuccessfulStage } });

    if (!record) {
      record = new ListsUploadStatus();
    }
    // errorInfo is limited 512 characters in DB
    record.errorInfo = (errorInfo || '').slice(0, 510);
    record.lastSuccessfulStage = lastSuccessfulStage ?? record.lastSuccessfulStage;
    record.updateTime = new Date();
    record.workerInstanceId = taskARN || '';
    record.listId = listId;
    await repository.save(record);
  } catch (error) {
    logger.error('Error updating/inserting record:', error);
  }
};

export const getMetadata = async (): Promise<{ taskARN: string }> => {
  const env: string = process.env.MICROSERVICES_ENV;

  if (env == undefined || ['test', 'dev', 'development', 'latest'].includes(env.toLowerCase())) {
    return { taskARN: `arn:aws:ecs:us-east-1:123456789012:task/cluster-name/uuid-${env ?? ''}` };
  }

  try {
    return fetchMetadata();
  } catch (error) {
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }
};

let cachedTaskARN: string | null = null;
async function fetchMetadata(): Promise<{ taskARN: string }> {
  if (!cachedTaskARN) {
    const metadataUrl = 'http://169.254.170.2/v2/metadata';
    try {
      const response = await axios.get<MetadataServiceType>(metadataUrl);
      const data = response.data;
      cachedTaskARN = data.TaskARN;
    } catch (error) {
      Logger.error(`Failed to fetch metadata: ${error.message}`);
      // ignore error so next call will try again
    }
  }
  return { taskARN: cachedTaskARN };
}
