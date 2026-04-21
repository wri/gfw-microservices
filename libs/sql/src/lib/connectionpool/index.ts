import * as mssql from 'mssql';
const pools = {};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Get or create a pool. If a pool doesn't exist the config must be provided.
 * If the pool does exist the config is ignored (even if it was different to the one provided
 * when creating the pool)
 * Each pool has a reference counter: useCount. When useCount is 0 the pool is closed, but
 * not deleted because multiple simultaneous requests may create pools with the same name.
 * close() has a 1 minute delay before closing the pool to encourage reuse.
 *
 * @param {string} name
 * @param  [config]
 * @return {Promise.<mssql.ConnectionPool>}
 */
export const get = async (name, config): Promise<mssql.ConnectionPool> => {
  const poolCount = pools[name] ? pools[name].useCount : 0;
  if (poolCount <= 0) {
    if (!config) {
      throw new Error('Pool does not exist');
    }

    let connectedConnection: mssql.ConnectionPool;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      let sqlConnection: mssql.ConnectionPool | undefined;
      try {
        sqlConnection = new mssql.ConnectionPool(config);
        connectedConnection = await sqlConnection.connect();
        break;
      } catch (err) {
        // Best-effort close to avoid leaking sockets/event listeners
        if (sqlConnection) {
          try {
            await sqlConnection.close();
          } catch {
            // ignore close errors
          }
        }
        if (attempt === MAX_RETRIES) {
          throw err;
        }
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(
          `Connection attempt ${attempt}/${MAX_RETRIES} failed for pool "${name}": ${errorMessage}. Retrying in ${RETRY_DELAY_MS}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }

    const pool = {
      useCount: 0,
      connectedConnection: connectedConnection,
    };

    const originalClose = connectedConnection.close.bind(connectedConnection);
    connectedConnection.close = () => {
      setTimeout(() => {
        pool.useCount--;
        if (pool.useCount <= 0) {
          originalClose();
        }
      }, 60 * 1000); // 1 minute delay before closing the pool
      return Promise.resolve(); // close is expected to return a promise
    };
    pools[name] = pool;
  }
  const pool = pools[name];
  pool.useCount++;
  return pool.connectedConnection;
};
