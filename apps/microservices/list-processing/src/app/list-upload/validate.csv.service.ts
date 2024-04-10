import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from '@wri-monorepos/aws';
import * as fs from 'fs';
import * as csv2Json from 'csvtojson';
import { validateLocation } from './validate.location';
import { error } from 'console';

@Injectable()
export class ValidateCSVService {
  private readonly logger = new Logger(ValidateCSVService.name);

  constructor(private readonly s3Service: S3Service) {}

  async execute(fileName: string, templateId: number) {
    this.logger.log(
      `Starting validating the file ${fileName} with the following templateId ${templateId} `
    );
    const bucket = process.env.LARGE_PROCESING_LIST_BUCKET;
    const fileDownloadedPath = await this.s3Service.writeS3fileIntoTmp(fileName, bucket);
    this.logger.log(`Downloaded the file and write it into ${fileDownloadedPath}`);
    const locationData = await csv2Json().fromFile(fileDownloadedPath);
    const errorList = validateLocation(locationData, templateId);
    this.logger.log(`Removing the file`);
    this.removeFile(fileDownloadedPath);
    return errorList;
  }

  removeFile(fileNameAndPath: string) {
    fs.unlinkSync(fileNameAndPath);
  }
}
