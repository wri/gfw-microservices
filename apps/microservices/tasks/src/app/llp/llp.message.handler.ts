import { Logger, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';

import { UspGetListNameSchema } from '@wri-monorepos/sql';
import { EmailService } from '@wri-monorepos/aws';
import { CSVService } from './csv.service';
import { ShapefileService } from './shapefile.service';
import { S3Service } from '@wri-monorepos/aws'

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};
AWS.config.update(awsConfig);

@Injectable()
export class LLPMessageHandler {
    private readonly logger = new Logger(LLPMessageHandler.name);

    constructor(
      private uspGetListNameSchema: UspGetListNameSchema,
      private emailService: EmailService,
      private csvService: CSVService,
      private shapefileService: ShapefileService,
      private s3Service: S3Service
    ){}


    async removeMessage(message: AWS.SQS.Message){
      const sqs = new AWS.SQS();

      const deleteParams = {
        QueueUrl: process.env.AWS_TMP_QUEUE,
        ReceiptHandle: message.ReceiptHandle
      };

      const removedMessage = await sqs.deleteMessage(deleteParams).promise();
      this.logger.log(`Removed message: ${JSON.stringify(removedMessage)}`);
    }

    @SqsMessageHandler('llp-generate-file', true)
    async handleMessage(messages: Array<AWS.SQS.Message>) {
      const [ message ] = messages;
      const filter = JSON.parse(message.Body);

      // TODO: improve remove message should be automatically
      this.removeMessage(message);

      filter.rowsPerPage = 5000;
      const { key, organizationDatabase, file, userEmail } = filter;

      this.logger.log(`Sending the email informing that the file generation is started.`)

      const { list_name: listName } = await this.uspGetListNameSchema.run(organizationDatabase, filter);


      this.emailService.sendEmail(
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

      // try {
        if ( file == 'csv'){
          await this.csvService.generate(filter);
        } else {
          await this.shapefileService.generate(filter);
        }

        const fileExtension = file === 'csv' ? 'csv' : 'zip';
        this.logger.log(`Existe arquivo ${fs.existsSync(`/tmp/${key}.${fileExtension}`)}`)
        if (fs.existsSync(`/tmp/${key}.${fileExtension}`)) {
          const contentType = file === 'csv' ? 'text/csv' : 'application/zip';
          await this.s3Service.sendFiletoS3(key, fileExtension, contentType, process.env.AWS_TMP_BUCKET);
          const location = await this.s3Service.getFileSignedUrl(key, fileExtension, process.env.AWS_TMP_BUCKET);

          this.logger.log(`Sending the email informing that the file generation is complete.`)
          this.emailService.sendEmail(process.env.SES_SENDER_EMAIL, [userEmail], `[GFW-PRO] File Generation for list ${listName}`, 'finish', {
            ...filter,
            location,
          });
        }
      /*} catch (error) {
        this.logger.log(`Error on generating the file: ${error.message}`)
        this.emailService.sendEmail(
          process.env.SES_SENDER_EMAIL,
          [userEmail],
          `[GFW-PRO] File Generation for list ${listName}`,
          'error',
          filter
        );
      }*/
    }
}
