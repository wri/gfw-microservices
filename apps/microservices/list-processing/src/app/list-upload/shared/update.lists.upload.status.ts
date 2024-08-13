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
  const connection = await clientStoreConnection.getConnection(clientStore, [ListsUploadStatus]);
  const repository = connection.getRepository(ListsUploadStatus);
  const { taskARN } = await getMetadata();

  try {
    let record = await repository.findOne({ where: { listId } });

    if (!record) {
      record = new ListsUploadStatus();
    }
    record.errorInfo = errorInfo;
    record.lastSuccessfulStage = lastSuccessfulStage ?? record.lastSuccessfulStage;
    record.updateTime = new Date();
    record.workerInstanceId = taskARN || '';
    record.listId = listId;
    await repository.save(record);
  } catch (error) {
    logger.error('Error updating/inserting record:', error);
  }
};

const getMetadata = async (): Promise<{ taskARN: string }> => {
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

async function fetchMetadata(): Promise<{ taskARN: string }> {
  const metadataUrl = 'http://169.254.170.2/v2/metadata';
  try {
    const response = await axios.get<MetadataServiceType>(metadataUrl);
    const data = response.data;
    const taskARN = data.TaskARN;

    return { taskARN };
  } catch (error) {
    throw new Error(`Failed to fetch metadata: ${error.message}`);
  }
}
