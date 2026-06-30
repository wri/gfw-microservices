import { ClientStoreConnection } from '../util';
import { systemEntities } from '../entity/system';
import { getAllUsersList } from '../queries/system/getAllUsersList';

export interface ProManagerUserExportRecord {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  access_level_id: number | null;
  organization_name: string | null;
  user_activated_time: Date | string | null;
  deactivation_date: Date | string | null;
  country: string | null;
  language: string | null;
}

export async function getProManagerUsersExport(): Promise<ProManagerUserExportRecord[]> {
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection('gfwpro', systemEntities);

  const results = await connection.query(`SET NOCOUNT ON;\n${getAllUsersList}`);

  return (results as Record<string, unknown>[]).map((row) => ({
    first_name: (row['first_name'] as string) ?? null,
    last_name: (row['last_name'] as string) ?? null,
    email: (row['email'] as string) ?? null,
    access_level_id: row['access_level_id'] != null ? Number(row['access_level_id']) : null,
    organization_name: (row['organization_name'] as string) ?? null,
    user_activated_time: (row['user_activated_time'] as Date | string) ?? null,
    deactivation_date: (row['deactivation_date'] as Date | string) ?? null,
    country: (row['country'] as string) ?? null,
    language: (row['language'] as string) ?? null,
  }));
}
