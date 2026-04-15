import { Injectable, BadRequestException } from '@nestjs/common';
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
import { ValidateLocationName } from './chain/validate.location.name';
import { AdjustGeoData } from './chain/adjust.geo.data';
import { ConvertPoint2Polygon } from './chain/convert.point.2.polygon';
import { ValidateLatLongGeojson } from './chain/validate.lat.long.geojson';

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
    const adjustGeoData = new AdjustGeoData();
    const gadmService = new GADMService();
    const previewStep = new PreviewStep();
    const validateMandatoryFields = new ValidateMandatoryFields();
    const validateLocationName = new ValidateLocationName();
    const convertPoint2Polygon = new ConvertPoint2Polygon();
    const validateLatLongGeojson = new ValidateLatLongGeojson();

    downloadS3File
      .setNext(parseData)
      .setNext(previewStep)
      .setNext(adjustGeoData) // ensures analysisArea is set and lat/long are extracted
      .setNext(validateMandatoryFields) // depends on centroid calculation in adjustGeoData
      .setNext(validateLocationName)
      .setNext(convertPoint2Polygon) // converts points with analysisArea/analysisRadius to polygons
      .setNext(validateLatLongGeojson) // validates coordinates are in supported range
      .setNext(gadmService); // depends on convertPoint2Polygon

    const response = await AbstractHandler.runFullChain(downloadS3File, chainType);

    // Check for errors in the geojson features
    const allErrors = [
      ...new Set(
        response.geojson.features.flatMap((feature) => feature.properties?.errorDetails || [])
      ),
    ];

    // Filter out specific lookup errors that should not cause exceptions
    const significantErrors = allErrors.filter(
      (error) =>
        typeof error === 'string' &&
        !error.startsWith('UML LookUp:') &&
        !error.startsWith('CAR LookUp: did not found lat/long for') &&
        !error.startsWith('ERROR in gadm request')
    );

    if (significantErrors.length > 0) {
      throw new BadRequestException({
        message: 'Validation errors found in the data',
        errors: significantErrors,
      });
    }

    // Filter out features with empty/invalid geometries (e.g., from GADM errors)
    // to ensure preview only returns renderable features
    const validFeatures = response.geojson.features.filter(
      (feature) => feature.geometry && Object.keys(feature.geometry).length > 0
    );

    return {
      ...response.geojson,
      features: validFeatures,
    };
  }
}
