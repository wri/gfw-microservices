import { v4 as uuidv4 } from 'uuid';

import { 
  getAccessLevel,
  getUserRoute,
  getUserInfo,
  insertPendingConnection,
  PendingConnection,
} from '@wri-monorepos/sql';

import { sendEmailB2B } from '@wri-monorepos/aws';
import { logger, ErrorException, ErrorCode  } from '@wri-monorepos/util';

import { 
  ERROR_USER_NOT_BELONG_ORGANIZATION, 
  ERROR_USER_NOT_ADMINISTRATOR,
  ERROR_SAME_ORGANIZATION,
} from '../utils/constants';

const checkUser = async (request: PendingConnection) => {
  const accessLevelList = await getAccessLevel();
  console.log(accessLevelList)

  const accessLevel = accessLevelList.find(al=> al.accesslevelName == 'Administrator')

  const userRoute = await getUserRoute(request.targetEmail); 
  console.log(userRoute)
  if ( userRoute.organizationId != request.targetOrganization) {
    logger.error(ERROR_USER_NOT_BELONG_ORGANIZATION);
    throw new ErrorException(ErrorCode.BadRequest, { message: ERROR_USER_NOT_BELONG_ORGANIZATION})
  }

  const userInfo = await getUserInfo(userRoute.organizationDatabase, request.targetEmail);
  if (userInfo.accessLevelId !=  accessLevel.id ) {
    logger.error(ERROR_USER_NOT_ADMINISTRATOR);
    throw new ErrorException(ErrorCode.BadRequest, { message: ERROR_USER_NOT_ADMINISTRATOR})
  }

  return userRoute;
}

const createPendingConnection =  async (request: PendingConnection) =>{
    logger.info(`Check user access if it is administrator ${request}`)

    if(request.targetOrganization == request.sourceOrganization){
      logger.error(ERROR_SAME_ORGANIZATION);
      throw new Error(ERROR_SAME_ORGANIZATION);
    }

    const userRouteTarget = await checkUser(request);
    const userRouteSource = await getUserRoute(request.sourceEmail);

    logger.info(`Insert pending connection to database`)
    let pendingConnection : PendingConnection = {
      sourceEmail: request.sourceEmail,
      targetEmail: request.targetEmail,
      sourceOrganization: userRouteSource.organizationId,
      targetOrganization: userRouteTarget.organizationId,
      token: uuidv4(),
      id: 0,
    }

    pendingConnection = await insertPendingConnection(pendingConnection);

    logger.info(`Sending the email informing that the file generation is complete.`)
    sendEmailB2B(process.env.SES_SENDER_EMAIL, [request.sourceEmail], `[GFW-PRO] B2B with ${request.targetOrganization}`, 'start', 'source' );

    logger.info(`Sending the email informing that the file generation is complete.`)
    sendEmailB2B(process.env.SES_SENDER_EMAIL, [request.targetEmail], `[GFW-PRO] B2B with ${request.targetOrganization}`, 'start', 'target' );

    return pendingConnection;
}

export {
  createPendingConnection,
}

