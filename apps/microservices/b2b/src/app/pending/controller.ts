import { 
  createPendingConnection,
  getPendingConnection,
  changeConnectionStatus
} from './service';
import { ErrorException, ErrorCode } from '@wri-monorepos/util';

import {  
  ERROR_INFORM_ORGANIZATION_ID,
} from '../utils/constants';

import { Request, Response } from 'express';

const addConnection =  async (request: Request, response: Response) => {
  const pending = request.body;
  const result = await createPendingConnection(pending);
  return response.status(201).json(result)
}

const listConnection = async (request: Request, response: Response) => {
  const organizationId = parseInt(request.query.organizationId as string , 10) || undefined;
  if (organizationId === undefined) {
      throw new ErrorException(ErrorCode.BadRequest, { message: ERROR_INFORM_ORGANIZATION_ID})
  }

  const id  = parseInt(request.query.id as string, 10) || undefined;
  const status = request.query.status as string;
  
  const result = await getPendingConnection({
      sourceOrganizationId: organizationId,
      id,
      status,
  });
  return response.status(200).json(result)
}

const acceptConnection = async (request: Request, response: Response) => {
  const pending = request.body;
  const result = await changeConnectionStatus(pending, "accept");
  return response.status(201).json(result)
}

const rejectConnection = async (request: Request, response: Response) => {
  const pending = request.body;
  const result = await changeConnectionStatus(pending, "reject");
  return response.status(201).json(result)
}

export {
  addConnection,
  listConnection,
  acceptConnection,
  rejectConnection
}