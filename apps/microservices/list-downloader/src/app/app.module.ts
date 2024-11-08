import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { serverConfigSchema } from '../validators/server-config';

// This needs to be at the beginning of the file to ensure that the '.env' file
// is loaded into process.env before any code reads process.env
const envModule = ConfigModule.forRoot({
  envFilePath: ['.env', '.env.production'],
  validate: (env) => serverConfigSchema.parse(env),
  isGlobal: true,
});

import { HealthModule } from './health/health.module';
import { ListModule } from './handler/list.module';
import { VerifiableCredentialModule } from './verifiable-credentials/verifiable.credentials.module';
@Module({
  imports: [envModule, HealthModule, ListModule, VerifiableCredentialModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
