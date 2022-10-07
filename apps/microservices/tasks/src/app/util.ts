import { stringList } from 'aws-sdk/clients/datapipeline';
import { logger } from './logger';

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

export interface Param {
  field: string;
  type: any;
  value: any;
}

export interface Filters {
  analysisArea?: string;
  analysisAreaOperator?: string;
  combinedColumns?: string;
  combinedColumnsSplited?: Array<string>;
  country?: string;
  file?: stringList;
  geometry?: number;
  key?: string;
  listID: number;
  listName?: string;
  orderType?: string;
  organizationDatabase?: string;
  page?: number;
  pageSize?: number;
  rowsPerPage?: number;
  selectedAreaMax?: string;
  selectedAreaMin?: string;
  sortByAttribute?: string;
  state?: string;
  subState?: string;
  type?: string;
  userEmail?: string;
}
