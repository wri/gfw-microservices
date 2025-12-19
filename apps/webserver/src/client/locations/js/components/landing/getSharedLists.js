import httpRequest from '../../../../common/js/utils/httpRequest';
import { mySharedLists } from '../../utils/sharedListMock';
import errorLogger from '../../../../common/js/utils/errorLogger';

const getLists = async (url) => {
  try {
    const response = await httpRequest.fetchJSON(url);
    const parsedResponse = JSON.parse(response);

    return parsedResponse;
  } catch (error) {
    errorLogger.error('Error fetching shared lists', {
      component: 'getSharedLists',
      action: 'getLists',
      error,
      url,
    });
    return mySharedLists;
  }
};

export const getMySharedLists = async () => {
  return await getLists('getSharedListsEndpoint');
};

export const getListsSharedWithMe = async () => {
  return await getLists('getListsSharedWithMeEndpoint');
};
