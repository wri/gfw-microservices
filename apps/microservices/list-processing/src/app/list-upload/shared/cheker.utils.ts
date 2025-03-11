import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';

export const checkIfListExist = async (listId, clientDatabase) => {
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(clientDatabase);
  const existingList = connection.getRepository(Lists).findOne({
    where: {
      id: listId,
    },
  });

  if (!existingList) {
    return false;
  }

  return true;
};
