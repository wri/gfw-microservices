import { 
  getTrustedConnection,
} from './service';

import { ErrorException, ErrorCode } from '@wri-monorepos/util';

import { Request, Response } from 'express';

import {  
  ERROR_INFORM_ORGANIZATION_ID,
} from '../utils/constants';

const listConnection = async (request: Request, response: Response) => {
  const organizationId = parseInt(request.query.organizationId as string , 10) || undefined;
  if (organizationId === undefined) {
      throw new ErrorException(ErrorCode.BadRequest, { message: ERROR_INFORM_ORGANIZATION_ID})
  }

  const id  = parseInt(request.query.id as string, 10) || undefined;
  const status = request.query.status as string;
  
  const result = await getTrustedConnection({
      sourceOrganizationId: organizationId,
      id,
      status,
  });
  return response.status(200).json(result)
}

export {
  listConnection,
}