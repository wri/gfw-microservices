import * as  fs from 'fs';

import { connectToSQS, sendCSVtoS3, getFileSignedUrl, sendEmailFile } from '@wri-monorepos/aws';
import { FileGenerationFilter } from '@wri-monorepos/sql';
import { logger } from '@wri-monorepos/util';

import { build as buildCSV}  from './csv';
import { build as buildShapefile } from './shapefile';


const genCSV = async (key: string, organizationDatabase: string, filter: FileGenerationFilter) => {
  await buildCSV(key, organizationDatabase, filter);
};

const genShapefile = async (key: string, organizationDatabase: string, filter: FileGenerationFilter) => {
  await buildShapefile(key, organizationDatabase, filter);
};

const receiveMessage = async (message) => {
  const filter = JSON.parse(message.Body);
  const { key, file, organizationDatabase } = filter;

  delete filter.key;
  delete filter.file;

  const { userEmail, listName } = filter;
  // sender, receivers, subject, content
  logger.info(`Sending the email informing that the file generation is started.`)
  sendEmailFile(
    process.env.SES_SENDER_EMAIL,
    [userEmail],
    `[GFW-PRO] File Generation for list ${listName}`,
    'start',
    filter
  );

  if (!Object.prototype.hasOwnProperty.call(filter, 'combinedColumns')) {
    filter.combinedColumnsSplited = [];
  } else {
    filter.combinedColumnsSplited = filter.combinedColumns.split(',');
  }

  const methods = {
    csv: genCSV,
    shapefile: genShapefile,
  };

  try {
    await methods[file](key, organizationDatabase, filter);
    const fileExtension = file === 'csv' ? 'csv' : 'zip';

    if (fs.existsSync(`/tmp/${key}.${fileExtension}`)) {
      const contentType = file === 'csv' ? 'text/csv' : 'application/zip';
      await sendCSVtoS3(key, fileExtension, contentType);
      const location = await getFileSignedUrl(key, fileExtension);
      logger.info(`Sending the email informing that the file generation is complete.`)
      sendEmailFile(process.env.SES_SENDER_EMAIL, [userEmail], `[GFW-PRO] File Generation for list ${listName}`, 'finish', {
        ...filter,
        location,
      });
    }
  } catch (error) {
    console.error(error);
    logger.error(`Error on generating the file: ${error.message}`)
    sendEmailFile(
      process.env.SES_SENDER_EMAIL,
      [userEmail],
      `[GFW-PRO] File Generation for list ${listName}`,
      'error',
      filter
    );
  }
};

export const start = () => {
  logger.info(`Start listenning to the queue: ${process.env.AWS_TMP_QUEUE}`)
  connectToSQS(receiveMessage);
};
