const path = require('path');
import * as sql from 'mssql';
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));

const { createListAnalysisStatus: createListAnalysisStatusQuery } = require(path.resolve(
  './queries/organization/createListAnalysisStatus'
));

const { getListAnalysisStatusById: getListAnalysisStatusByIdQuery } = require(path.resolve(
  './queries/organization/getListAnalysisStatusById'
));

const {
  dropListAnalysisStatusByListId: dropListAnalysisStatusByListIdQuery,
} = require(path.resolve('./queries/organization/dropListAnalysisStatusByListId'));

const getListAnalysisStatusById = async (req, listId) => {
  const parameters = [{ field: 'listID', type: sql.Int, value: listId }];
  const [response] = await sqlUtils.executeOrganizationQuery(
    req,
    getListAnalysisStatusByIdQuery,
    parameters
  );
  return response;
};

const createOrUpdateListAnalysis = async (req, listId, analysisData) => {
  const response = getListAnalysisStatusById(req, listId);

  if (response === undefined || response === null || response.length === 0) {
    createListAnalysis(req, listId, analysisData);
  } else {
    updateListAnalysis(req, listId, analysisData);
  }
};

const createListAnalysis = async (req, listId, analysisData) => {
  for (const element of analysisData) {
    const params = [
      {
        field: 'ListID',
        type: sql.Int,
        value: listId,
      },
      {
        field: 'AnalysisID',
        type: sql.NVarChar(150),
        value: element,
      },
    ];
    await sqlUtils.executeOrganizationQuery(req, createListAnalysisStatusQuery, params);
  }
};

const deleteListAnalysis = async (req, listId) => {
  await sqlUtils.executeOrganizationQuery(req, dropListAnalysisStatusByListIdQuery, [
    {
      field: 'ListID',
      type: sql.Int,
      value: listId,
    },
  ]);
};

const updateListAnalysis = async (req, listId, analysisData) => {
  await deleteListAnalysis(req, listId);
  await createListAnalysis(req, listId, analysisData);
};

export { createOrUpdateListAnalysis, getListAnalysisStatusById };
