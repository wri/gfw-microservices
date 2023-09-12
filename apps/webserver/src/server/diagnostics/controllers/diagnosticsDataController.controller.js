const path = require('path');
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const ShareManager = require('../../../config/publicutils/shareManager.utils');
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const { setListData } = require(path.resolve('./config/publicutils/setListData'));
const { getAnalysisFromGFWList } = require('./getAnalysisFromGFWList');
const { getAnalysisFromUserList } = require('./getAnalysisFromUserList');
const {
  getAnalysisFromAdministrativeAreasList,
} = require('./getAnalysisFromAdministrativeAreasList');
const { getAnalysisFromProtectedAreasList } = require('./getAnalysisFromProtectedAreasList');

const {
  findSharedListsInsideOrganization,
} = require('../../../config/publicutils/shareManager.utils');
const { GFW_LISTS_NUMBER_CONSTANTS } = require(path.resolve('./config/env/gfwLists.constants'));


exports.diagnosticsDataController = async (req, res) => {
  const { listId, isGfwList, isSharedList, locationId } = req.body;

  const { ADMINISTRATIVE_AREAS, PROTECTED_AREAS } = GFW_LISTS_NUMBER_CONSTANTS;

  const promises = [
    ListManager.getAllLists(req),
    GFWListManager.getGFWLists(req),
    ListManager.getUserLists(req),
    ShareManager.getUserInternalShareLists(req, req.session.organization_user_id),
  ];

  Promise.all(promises)
    .then(async (results) => {
      const [orgLists, gfwLists, userLists, sharedListsRecords] = results;
      const userSharedLists = findSharedListsInsideOrganization(sharedListsRecords, orgLists);
      const listToSearch = isGfwList ? gfwLists : isSharedList ? userSharedLists : userLists;
      const selectedList = listToSearch?.find((listData) => listData.id === listId);
      const selectedLists = selectedList ? [selectedList] : null;

      if (!selectedLists) {
        res.status(200).json({
          selectedLists: null,
          listLevelAnalysis: null,
          processedListData: null,
        });
        return;
      }

      let analysisData;
      if (isGfwList && listId === ADMINISTRATIVE_AREAS) {
        // for this list we can only see location diagnostics, not full list diagnostics
        analysisData = await getAnalysisFromAdministrativeAreasList(req, locationId);
      } else if (isGfwList && listId === PROTECTED_AREAS) {
        // for this list we can only see location diagnostics, not full list diagnostics
        analysisData = await getAnalysisFromProtectedAreasList(req, locationId);
      } else if (isGfwList) {
        analysisData = await getAnalysisFromGFWList(req, listId);
      } else {
        analysisData = await getAnalysisFromUserList(req, listId);
      }

      const { list_analysis, location_analyses } = analysisData;
      const processedListData = setListData(
        location_analyses[0],
        location_analyses[1],
        selectedLists
      );

      res.status(200).json({
        selectedLists,
        listLevelAnalysis: list_analysis,
        processedListData,
      });
    })
    .catch((err) => {
      console.log('diagnostics failed on the server:', err);
    });
};

