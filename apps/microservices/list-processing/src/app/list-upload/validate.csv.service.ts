import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from '@wri-monorepos/aws';
import * as fs from 'fs';
import * as csv2Json from 'csvtojson';
import { validateLocation } from './validate.location';
import { ValidateCsvRepository } from './validate.csv.repository';

@Injectable()
export class ValidateCSVService {
  private readonly logger = new Logger(ValidateCSVService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly validateCSVRepository: ValidateCsvRepository
  ) {}

  async execute(fileName: string, templateId: number) {
    this.logger.log(
      `Starting validating the file ${fileName} with the following templateId ${templateId} `
    );
    const bucket = process.env.LARGE_PROCESING_LIST_BUCKET;
    const fileDownloadedPath = await this.s3Service.writeS3fileIntoTmp(fileName, bucket);
    this.logger.log(`Downloaded the file and write it into ${fileDownloadedPath}`);
    const locationData = await csv2Json().fromFile(fileDownloadedPath);

    const templateName = await this.getTemplateName(templateId);
    if (!templateName) {
      return ['was not possible to find a template with the informed id.'];
    }

    const errorList = validateLocation(locationData, templateName);
    this.logger.log(`Removing the file`);
    this.removeFile(fileDownloadedPath);
    return errorList;
  }

  removeFile(fileNameAndPath: string) {
    fs.unlinkSync(fileNameAndPath);
  }

  async getTemplateName(templateId: number): Promise<string> {
    const allTemplates = await this.validateCSVRepository.getAllListTemplates();
    const template = allTemplates.find((lt) => lt.id == templateId);
    if (template) {
      let templateName = template.templateName;
      templateName = templateName.replace(/ /g, '');
      templateName = templateName.charAt(0).toLowerCase() + templateName.slice(1);
      return templateName;
    }
    return;
  }
}
