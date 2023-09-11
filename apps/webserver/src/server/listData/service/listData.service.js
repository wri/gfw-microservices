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
  dropListAnalysisStatusByListIdAndAnalysisId: dropListAnalysisStatusByListIdAndAnalysisIdQuery,
} = require(path.resolve('./queries/organization/dropListAnalysisStatusByListIdAndAnalysisId'));

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
  const response = await getListAnalysisStatusById(req, listId);

  if (response === undefined || response === null || response.length === 0) {
    createListAnalysis(req, listId, analysisData);
  } else {
    updateListAnalysis(req, listId, analysisData, response);
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

const deleteListAnalysis = async (req, listId, analysisID) => {
  await sqlUtils.executeOrganizationQuery(req, dropListAnalysisStatusByListIdAndAnalysisIdQuery, [
    {
      field: 'ListID',
      type: sql.Int,
      value: listId,
    },
    {
      field: 'AnalysisID',
      type: sql.NVarChar(150),
      value: analysisID,
    },
  ]);
};

const updateListAnalysis = async (req, listId, analysisData, currentAnalysis) => {
  const analysisDataIds = currentAnalysis.map((analysis) => analysis.AnalysisID);

  for (const element of analysisDataIds) {
    if (!analysisData.includes(element)) {
      deleteListAnalysis(req, listId, element);
    }
  }

  for (const element of analysisData) {
    if (!analysisDataIds.includes(element)) {
      createListAnalysis(req, listId, [element]);
    }
  }
};

export { createOrUpdateListAnalysis, getListAnalysisStatusById };
