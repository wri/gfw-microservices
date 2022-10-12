import { logger } from '@wri-monorepos/util'
/**
 * @function createErrorMessage
 * @summary Creates a new standard error message object that can be used across.
 * @param {int} errorCode - Error Code used for identifying the error.
 * @param {String} userMessage - A message that could be provided to the user if necessary.
 * @param {String} systemMessage - The more detailed system message for logging or debugging.
 * @return {Object} An error message object containing the above parameters.
 */
 export const createErrorMessage = (errorCode: number, userMsg: string, systemMsg: string) => {
    const objError = {
      errorCode,
      userMessage: userMsg,
      systemMessage: systemMsg,
    };
  
    logger.error(objError);
    return objError;
};
  