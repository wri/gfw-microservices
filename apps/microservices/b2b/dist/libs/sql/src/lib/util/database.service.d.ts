import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
export declare class DatabaseService implements TypeOrmOptionsFactory {
    private readonly config;
    createTypeOrmOptions(): TypeOrmModuleOptions;
}
