import {
  uspGetTrustConnection,
  GetConnectionRequest,
} from '@wri-monorepos/sql';

import { logger, ErrorException, ErrorCode  } from '@wri-monorepos/util';

const getTrustedConnection = async (request: GetConnectionRequest) => {
  logger.info(`Get trusted connection ${request}`)
  const trustedList = await uspGetTrustConnection(request);
  return trustedList;
}

export {
  getTrustedConnection,
}
