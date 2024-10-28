import { Module } from '@nestjs/common';
import { VerifiableCredentialsController } from './verifiable.credentials.controller';
import { VerifiableCredentialService } from './verifiable.credentials.service';

@Module({
  imports: [],
  controllers: [VerifiableCredentialsController],
  exports: [],
  providers: [VerifiableCredentialService],
})
export class VerifiableCredentialModule {}
