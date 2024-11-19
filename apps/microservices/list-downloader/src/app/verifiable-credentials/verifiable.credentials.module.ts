import { Module } from '@nestjs/common';
import { VerifiableCredentialService } from './verifiable.credentials.service';

@Module({
  imports: [],
  controllers: [],
  exports: [],
  providers: [VerifiableCredentialService],
})
export class VerifiableCredentialModule {}
