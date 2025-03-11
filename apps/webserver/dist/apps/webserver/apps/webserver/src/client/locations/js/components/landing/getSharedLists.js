import httpRequest from '../../../../common/js/utils/httpRequest';
import { mySharedLists } from '../../utils/sharedListMock';

const getLists = async (url) => {
  try {
    const response = await httpRequest.fetchJSON(url);
    const parsedResponse = JSON.parse(response);

    return parsedResponse;
  } catch (error) {
    console.error(error);
    return mySharedLists;
  }
};

export const getMySharedLists = async () => {
  return await getLists('getSharedListsEndpoint');
};

export const getListsSharedWithMe = async () => {
  return await getLists('getListsSharedWithMeEndpoint');
};
