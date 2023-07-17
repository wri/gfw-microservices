import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeOrmSQLITETestingModule = (forFeatureEntities = []) => [
  TypeOrmModule.forRoot({
    type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    entities: forFeatureEntities,
    synchronize: true,
  }),
  //TypeOrmModule.forFeature(forFeatureEntities),
];
