import { Body, Controller, Get, Injectable, Logger, Scope } from '@nestjs/common';
import { VerifiableCredentialService } from './verifiable.credentials.service';
import { geoJsonSchema } from './types/geojson.schema';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { GeoJson } from './types/verifiable-credential.model';
@Injectable()
@Controller({
  path: 'verifiable-credentials',
  scope: Scope.REQUEST,
})
export class VerifiableCredentialsController {
  private readonly logger = new Logger(VerifiableCredentialsController.name);
  constructor(private readonly verifiableCredentialService: VerifiableCredentialService) {}
  @Get('signed-vc')
  async signedVcOutput(@Body(new ZodValidationPipe(geoJsonSchema)) geoJsonBody: GeoJson) {
    this.logger.log('Verifiable Credentials message received');
    return await this.verifiableCredentialService.signedVcOutput(geoJsonBody);
  }
}
