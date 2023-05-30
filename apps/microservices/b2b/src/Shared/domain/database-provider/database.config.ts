export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export const databaseConfig: Record<string, DatabaseConfig> = {
  gfwpro: {
    host: '52.45.199.190',
    port: 65300,
    username: 'GFWProUser',
    password: 'measure2010!',
    database: 'gfwpro',
  },
  'clientstore-DevCo': {
    host: '52.45.199.190',
    port: 65300,
    username: 'GFWProUser',
    password: 'measure2010!',
    database: 'clientstore-QACO',
  },
};
