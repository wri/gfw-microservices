import { v4 as uuidv4 } from 'uuid';

import { 
  uspGetAccessLevels,
  uspGetVerifiedUserRouteInfo,
  uspGetUserInfoByEmail,
  uspCreatePendingConnection,
  uspGetPendingConnection,
  uspAcceptTrustedConnection,
  uspUpdatePendingConnectionStatus,
  uspGetTrustConnection,
  CreatePendingConnectionRequest,
  GetConnectionRequest,
  ChangeStatusPendingConnectionRequest
} from '@wri-monorepos/sql';

import { sendEmailB2B } from '@wri-monorepos/aws';
import { logger, ErrorException, ErrorCode  } from '@wri-monorepos/util';

import { 
  ERROR_USER_NOT_BELONG_ORGANIZATION, 
  ERROR_USER_NOT_ADMINISTRATOR,
  ERROR_SAME_ORGANIZATION,
  ERROR_CONNECTION_ALREADY_EXIST,
} from '../utils/constants';

const checkUser = async (userEmail: string, organizationId: number) => {
  const accessLevelList = await uspGetAccessLevels();

  const accessLevel = accessLevelList.find(al=> al.accesslevelName == 'Administrator')

  const userRoute = await uspGetVerifiedUserRouteInfo(userEmail); 
  if ( userRoute.organizationId != organizationId) {
    throw new ErrorException(ErrorCode.BadRequest, { message: ERROR_USER_NOT_BELONG_ORGANIZATION})
  }

  const userInfo = await uspGetUserInfoByEmail(userRoute.organizationDatabase, userEmail);
  if (userInfo.accessLevelId !=  accessLevel.id ) {
    throw new ErrorException(ErrorCode.BadRequest, { message: ERROR_USER_NOT_ADMINISTRATOR})
  }

  return userRoute;
}

const createPendingConnection =  async (request: CreatePendingConnectionRequest) =>{
    logger.info(`Check user access if it is administrator ${request}`)

    if(request.targetOrganization == request.sourceOrganization){
      throw new ErrorException(ErrorCode.BadRequest, { message: ERROR_SAME_ORGANIZATION });
    }

    const userRouteTarget = await checkUser(request.targetEmail, request.targetOrganization);
    const userRouteSource = await checkUser(request.sourceEmail, request.sourceOrganization);

    const trustConnection = uspGetTrustConnection({
      sourceOrganizationId: request.sourceOrganization,
      targetOrganizationId: request.targetOrganization,
    })

    if(trustConnection){
      throw new ErrorException(ErrorCode.BadRequest, { message: ERROR_CONNECTION_ALREADY_EXIST });
    }

    logger.info(`Insert pending connection to database`)
    let pendingConnection : CreatePendingConnectionRequest = {
      sourceEmail: request.sourceEmail,
      targetEmail: request.targetEmail,
      sourceOrganization: userRouteSource.organizationId,
      targetOrganization: userRouteTarget.organizationId,
      token: uuidv4(),
      id: 0,
    }

    pendingConnection = await uspCreatePendingConnection(pendingConnection);

    logger.info(`Sending the email informing that the file generation is complete.`)
    sendEmailB2B(process.env.SES_SENDER_EMAIL, [request.sourceEmail], `[GFW-PRO] B2B with ${request.targetOrganization}`, 'start', 'source' );

    logger.info(`Sending the email informing that the file generation is complete.`)
    sendEmailB2B(process.env.SES_SENDER_EMAIL, [request.targetEmail], `[GFW-PRO] B2B with ${request.targetOrganization}`, 'start', 'target' );

    return pendingConnection;
}

const getPendingConnection = async (request: GetConnectionRequest) => {
  logger.info(`Get pending connection ${request}`)
  const pendingList = await uspGetPendingConnection(request);
  return pendingList;
}

const changeConnectionStatus =  async (request: ChangeStatusPendingConnectionRequest, status: string) => {
  logger.info(`change connection status ${request}`)
  await checkUser(request.userEmail, request.organizationId);

  if(status == 'accept'){
    uspAcceptTrustedConnection(request);
  } else if(status == 'reject'){
    uspUpdatePendingConnectionStatus(request);
  }
}

export {
  createPendingConnection,
  getPendingConnection,
  changeConnectionStatus
}