import { Inject, Injectable, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
// TODO: Load entities dynamically
@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;
  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mssql',
      host: this.config.get<string>('MSSQL_HOSTNAME'),
      port: parseInt(this.config.get<string>('MSSQL_PORT'), 10),
      database: this.config.get<string>('MSSQL_DATABASE'),
      username: this.config.get<string>('MSSQL_USERNAME'),
      password: this.config.get<string>('MSSQL_PASSWORD'),
      synchronize: false,
      extra: {
        trustServerCertificate: true,
      },
    };
  }
}
