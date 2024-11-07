const path = require('path');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const sql = require('mssql');
import {
  getAllListsAnalysisStatus as getAllListsAnalysisStatusQuery,
  getListAnalysisStatusById,
} from '@wri-monorepos/sql';
import { readAnalysesLastModifiedTime } from '@wri-monorepos/shared';
import { S3Service } from '@wri-monorepos/aws';
import * as logger from '../../../config/privateutils/logger.utils';

const getAllListsAnalysisStatus = async (req) => {
  const s3 = new S3Service();
  try {
    const analysisTypesLastModifiedData = await readAnalysesLastModifiedTime(s3);
    const [response] = await sqlUtils.executeOrganizationQuery(req, getAllListsAnalysisStatusQuery);

    return response.map((analysisStatus) => {
      const analysisTypeLastModified = analysisTypesLastModifiedData.find(
        (analysisType) => analysisType.id === analysisStatus.analysisId
      );

      return {
        ...analysisStatus,
        analysisIdLastModifed: analysisTypeLastModified.last_run,
      };
    });
  } catch (error) {
    logger.error('Error getting all lists analysis status', error.stack || error);
  }
};

const getListAnalysisStatusByListId = async (req, listId) => {
  const params = [{ field: 'ListID', type: sql.Int, value: listId }];
  const [response] = await sqlUtils.executeOrganizationQuery(
    req,
    getListAnalysisStatusById,
    params
  );
  return response;
};

module.exports = {
  getAllListsAnalysisStatus,
  getListAnalysisStatusByListId,
};
