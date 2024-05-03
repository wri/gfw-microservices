const path = require('path');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const sql = require('mssql');
import {
  getAllListsAnalysisStatus as getAllListsAnalysisStatusQuery,
  getListAnalysisStatusById,
} from '@wri-monorepos/sql';

const getAllListsAnalysisStatus = async (req) => {
  const [response] = await sqlUtils.executeOrganizationQuery(req, getAllListsAnalysisStatusQuery);
  return response;
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
