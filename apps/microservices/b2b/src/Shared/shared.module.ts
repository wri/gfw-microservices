import { Module } from '@nestjs/common';
import { MapperQueryTypeORM } from './infraestructure/typeorm/query.mapper';

@Module({
  providers: [MapperQueryTypeORM],
  exports: [MapperQueryTypeORM],
})
export class SharedModule {}
