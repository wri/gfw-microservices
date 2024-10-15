import { Injectable } from '@nestjs/common';
import { FeatureCollection } from '@wri-monorepos/geo';
import { ChainType } from './chain/types';
import { DownloadS3File } from './chain/download.s3.file';
import { ParserData } from './chain/parser.data';
import { GADMService } from './chain/gadm.service';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';

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

    downloadS3File.setNext(parseData).setNext(gadmService);

    const response = await downloadS3File.handle(chainType);
    return response.geojson;
  }
}
