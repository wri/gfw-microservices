import { Module } from '@nestjs/common';
import { MapperFindTypeORM } from './infraestructure/typeorm/find.mapper';
import { MapperQueryTypeORM } from './infraestructure/typeorm/query-builder.mapper';

@Module({
  providers: [MapperQueryTypeORM, MapperFindTypeORM],
  exports: [MapperQueryTypeORM, MapperFindTypeORM],
})
export class SharedModule {}
