export const sqlConfig = {
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOSTNAME,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  port: parseInt(process.env.MSSQL_PORT, 10),
  options: {
    //encrypt: true, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};
