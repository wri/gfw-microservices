import { Lists, ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { EntitySchema } from 'typeorm';

export const getTotalLocationCount = async (
  clientStoreConnection,
  organizationDatabase,
  listId
): Promise<number> => {
  const connection = await clientStoreConnection.getConnection(organizationDatabase);
  const listRepository = connection.getRepository(Lists);
  const list = await listRepository.findOne({ where: { id: listId } });
  const { listLocationsCount } = list;
  return listLocationsCount;
};

export const getMaxLocationId = async (
  clientStoreConnection,
  organizationDatabase,
  listId
): Promise<number> => {
  let connection = await clientStoreConnection.getConnection(organizationDatabase);
  const listRepository = connection.getRepository(Lists);
  const { listTableName } = await listRepository.findOne({ where: { id: listId } });

  if (!listTableName) {
    return 0;
  }
  const ListEntity = new EntitySchema<ListSchemaType>({
    ...ListSchema,
    name: listTableName,
  });
  connection = await clientStoreConnection.getConnection(organizationDatabase, [ListEntity]);
  const listLocationRepository = connection.getRepository(ListEntity);
  const result = await listLocationRepository
    .createQueryBuilder()
    .select('MAX(location_id)', 'max_id')
    .getRawOne();

  return result?.max_id || 0;
};
