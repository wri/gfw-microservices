import { ClientStoreConnection } from '@wri-monorepos/sql';
import { User } from '@wri-monorepos/sql';

export const getUserEmail = async (organizationDatabase: string, user_id: number) => {
  const connection = await new ClientStoreConnection().getConnection(organizationDatabase);
  const userRepository = connection.getRepository(User);
  const { email } = await userRepository.findOne({ where: { id: user_id } });
  return email;
};
