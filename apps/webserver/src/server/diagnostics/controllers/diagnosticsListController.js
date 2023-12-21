const path = require('path');
const logger = require('../../../config/privateutils/logger.utils');
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const SharedListManager = require(path.resolve('./config/publicutils/shareManager.utils'));
const getAnalysisFromAdministrativeAreasList = require('./gfwListsDiagnosticsFunctions/getAnalysisFromAdministrativeAreasList');
const getAnalysisFromProtectedAreasList = require('./gfwListsDiagnosticsFunctions/getAnalysisFromProtectedAreasList');
const getAnalysisFromGFWList = require('./gfwListsDiagnosticsFunctions/getAnalysisFromGFWList');
const getAnalysisFromUserList = require('./orgListDiagnosticsFunctions/getAnalysisFromUserList');
const setListData = require(path.resolve('./config/publicutils/setListData'));
import { gfwListsIds } from '@wri-monorepos/constants';

/**
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
  const { isSharedList } = req.body;
  logger.info(`POST /diagnostics/${listId}`);

  try {
    let selectedList;

    if (GFWListManager.isGfwList(listId)) {
      selectedList = await GFWListManager.getGFWListsByListId(req, listId);
    } else {
      if (Boolean(isSharedList)) {
        const { organization_user_id: userId } = req.session;

        const allLists = await ListManager.getAllListsWithAnalysisId(req);
        const orgSharedLists = await SharedListManager.getUserInternalShareLists(req, userId);

        const filteredSharedLists = SharedListManager.findSharedListsInsideOrganization(
          orgSharedLists,
          allLists
        );

        /**
         * @summary will this path execute
         * if the user can (supposedly) access
         * their shared list thru the app?
         *
         * •= if app shows lists shared by user_id
         * •= then filteredSharedLists should always
         * contain a list
         *
         */
        if (!filteredSharedLists.lenth) {
          return res.status(500).json({
            selectedList: null,
          });
        }

        selectedList = allLists.find((list) => list.id == listId);
      } else {
        selectedList = await ListManager.getListByIdWithAnalysisId(req, listId);
      }
    }

    const getAnalysisData = getDiagnosticsAnalysisFunction(listId);
    const analysisData = await getAnalysisData(req, selectedList);

    const { spatialData, listLocationsIds, listAnalysis, locationAnalyses } = analysisData;
    const [locationData, locationAnalysisData] = locationAnalyses;

    const processedListData = setListData(
      locationData || [],
      locationAnalysisData || [],
      selectedList
    );

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
