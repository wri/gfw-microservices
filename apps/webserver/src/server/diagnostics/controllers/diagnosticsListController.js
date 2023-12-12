const path = require('path');
const logger = require('../../../config/privateutils/logger.utils');
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const getAnalysisFromAdministrativeAreasList = require('./gfwListsDiagnosticsFunctions/getAnalysisFromAdministrativeAreasList');
const getAnalysisFromProtectedAreasList = require('./gfwListsDiagnosticsFunctions/getAnalysisFromProtectedAreasList');
const getAnalysisFromGFWList = require('./gfwListsDiagnosticsFunctions/getAnalysisFromGFWList');
const getAnalysisFromUserList = require('./orgListDiagnosticsFunctions/getAnalysisFromUserList');
const setListData = require(path.resolve('./config/publicutils/setListData'));
import { gfwListsIds } from '@wri-monorepos/constants';

/**
 * TODO: move to its own file?
 * @summary Get the corresponding analysis function for this list.
 * @note Each of these function receives the express request object and the current list in context.
 * @param {Number|Int} listId listid
 * @returns {Function}
 */
const getDiagnosticsAnalysisFunction = (listId) => {
  // function map for GfwLists analysis
  const analysisFunctionsMap = {
    [gfwListsIds.ADMINISTRATIVE_AREAS]: getAnalysisFromAdministrativeAreasList,
    [gfwListsIds.PROTECTED_AREAS]: getAnalysisFromProtectedAreasList,
    [gfwListsIds.OIL_PALM_CONCESSIONS]: getAnalysisFromGFWList,
    [gfwListsIds.PALM_OIL_MILLS]: getAnalysisFromGFWList,
    [gfwListsIds.RSPO_PALM_CONCESSIONS]: getAnalysisFromGFWList,
  };
  // return analysis function for either a GfwList or userProList
  return analysisFunctionsMap[listId] || getAnalysisFromUserList;
};

module.exports = async function (req, res) {
  const listId = Number(req.params.listId);
  logger.info(`POST /diagnostics/${listId}`);

  try {
    let selectedList;

    if (GFWListManager.isGfwList(listId)) {
      selectedList = await GFWListManager.getGFWListsByListId(req, listId);
    } else {
      selectedList = await ListManager.getListByIdWithAnalysisId(req, listId);
    }

    const getAnalysisData = getDiagnosticsAnalysisFunction(listId);
    const analysisData = await getAnalysisData(req, selectedList);

    const { spatialData, listLocationsIds, listAnalysis, locationAnalyses } = analysisData;

    const [locationData, locationAnalysisData] = locationAnalyses;

    const processedListData = setListData(locationData || [], locationAnalysisData || [], [
      selectedList,
    ]);

    return res.status(200).send({
      selectedList,
      listLevelAnalysis: listAnalysis,
      processedListData,
      spatialData,
      listLocationsIds,
    });
  } catch (error) {
    logger.error(`POST /diagnostics/${listId}`, error);
    res.status(500).send(error);
  }
};
