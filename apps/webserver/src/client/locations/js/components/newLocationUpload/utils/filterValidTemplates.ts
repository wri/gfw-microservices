import { UserList } from '../types';
import { deduceActiveId } from '../../../../../common/js/utils/templateUtils';
import { getListValidStatus } from '../../../utils/lists.utils';

export const filterValidTemplates = (userList: UserList, activeTemplates: string[]) => {
  const validListStatus = getListValidStatus(userList.list_status_id);

  const templateIdFound = activeTemplates?.some(
    (activeTemplate) => userList?.template_id === deduceActiveId(activeTemplate)
  );

  const hasSameClassification = !(userList?.template_id === 1 && !userList.location_classification);

  return validListStatus && templateIdFound && hasSameClassification;
};
