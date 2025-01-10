import { Injectable } from '@nestjs/common';
import { FeatureCollection } from '@wri-monorepos/geo';
import { AbstractHandler, ChainType } from './chain/types';
import { DownloadS3File } from './chain/download.s3.file';
import { ParserData } from './chain/parser.data';
import { GADMService } from './chain/gadm.service';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { PreviewStep } from './chain/preview.step';
import { ValidateMandatoryFields } from './chain/validate.mandatory.fields';
import { ValidateLatLongGeojson } from './chain/validate.lat.long.geojson';
import { ValidateLocationName } from './chain/validate.location.name';

@Injectable()
export class PreviewListUploadService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {}

  async previewData(path: string): Promise<FeatureCollection> {
    const chainType: ChainType = {
      request: {
        path,
        preview: true,
      },
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    const downloadS3File = new DownloadS3File(this.s3Service, this.config);
    const parseData = new ParserData();
    const gadmService = new GADMService();
    const previewStep = new PreviewStep();
    const validateMandatoryFields = new ValidateMandatoryFields();
    const validateLatLongGeojson = new ValidateLatLongGeojson();
    const validateLocationName = new ValidateLocationName();

    downloadS3File
      .setNext(parseData)
      .setNext(previewStep)
      .setNext(validateMandatoryFields)
      .setNext(validateLocationName)
      .setNext(gadmService)
      .setNext(validateLatLongGeojson);

    const response = await AbstractHandler.runFullChain(downloadS3File, chainType);
    return response.geojson;
  }
}
