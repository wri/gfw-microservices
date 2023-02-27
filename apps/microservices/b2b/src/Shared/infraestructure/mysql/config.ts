export const SqlConfig = {
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  //database: clientDatabase,
  server: process.env.MSSQL_HOSTNAME,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  port: parseInt(process.env.MSSQL_PORT),
  options: {
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};
