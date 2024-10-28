import { Controller, Get, Injectable, Logger, Scope } from '@nestjs/common';
import { VerifiableCredentialService } from './verifiable.credentials.service';

@Injectable()
@Controller({
  path: 'verifiable-credentials',
  scope: Scope.REQUEST,
})
export class VerifiableCredentialsController {
  private readonly logger = new Logger(VerifiableCredentialsController.name);
  constructor(private readonly verifiableCredentialService: VerifiableCredentialService) {}
  @Get('signed-vc')
  async signedVcOutput() {
    this.logger.log('Verifiable Credentials message received');
    return await this.verifiableCredentialService.signedVcOutput();
  }
}
