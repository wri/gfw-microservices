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
