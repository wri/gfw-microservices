import * as logger from '../../../config/privateutils/logger.utils';
import {
  getAllListsWithAnalysisId,
  getListByIdWithAnalysisId,
} from '../../../config/publicutils/listManager.utils';
import { getGFWListsByListId } from '../../../config/publicutils/gfwListManager.utils';
import {
  getUserInternalShareLists,
  findSharedListsInsideOrganization,
} from '../../../config/publicutils/shareManager.utils';
import getAnalysisFromAdministrativeAreasList from './gfwListsDiagnosticsFunctions/getAnalysisFromAdministrativeAreasList';
import { getAnalysisFromProtectedAreasList } from './gfwListsDiagnosticsFunctions/getAnalysisFromProtectedAreasList';
import { getAnalysisFromGFWList } from './gfwListsDiagnosticsFunctions/getAnalysisFromGFWList';
import { getAnalysisFromUserList } from './orgListDiagnosticsFunctions/getAnalysisFromUserList';
import { setListData } from '../../../config/publicutils/setListData';
import { gfwListsIds } from '@wri-monorepos/constants';

/**
 * @summary Get the corresponding analysis function for this list.
 * @note Each of these function receives the express request object and the current list in context.
 * @param {boolean} isGfwList
 * @param {Number} listId
 * @returns {Function}
 */
const getDiagnosticsAnalysisFunction = (isGfwList, listId) => {
  // function map for GfwLists analysis
  const analysisFunctionsMap = {
    [gfwListsIds.ADMINISTRATIVE_AREAS]: getAnalysisFromAdministrativeAreasList,
    [gfwListsIds.PROTECTED_AREAS]: getAnalysisFromProtectedAreasList,
    [gfwListsIds.OIL_PALM_CONCESSIONS]: getAnalysisFromGFWList,
    [gfwListsIds.PALM_OIL_MILLS]: getAnalysisFromGFWList,
    [gfwListsIds.RSPO_PALM_CONCESSIONS]: getAnalysisFromGFWList,
  };
  if (isGfwList) {
    return analysisFunctionsMap[listId];
  }
  return getAnalysisFromUserList;
};

export const diagnosticsListController = async (req, res) => {
  const listId = Number(req.params.listId);
  const { isGfwList, isSharedList } = req.body;
  logger.info(`POST /diagnostics/${listId}`);

  try {
    let selectedList;

    if (isGfwList) {
      selectedList = await getGFWListsByListId(req, listId);
    } else {
      if (isSharedList) {
        const { organization_user_id: userId } = req.session;

        const allLists = (await getAllListsWithAnalysisId(req)) as Array<{ id: number }>;
        const orgSharedLists = await getUserInternalShareLists(req, userId);

        const filteredSharedLists = findSharedListsInsideOrganization(orgSharedLists, allLists);

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
        if (!filteredSharedLists.length) {
          return res.status(500).json({
            selectedList: null,
          });
        }

        selectedList = allLists.find((list) => list.id == listId);
      } else {
        selectedList = await getListByIdWithAnalysisId(req, listId);
      }
    }

    const getAnalysisData = getDiagnosticsAnalysisFunction(isGfwList, listId);
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
