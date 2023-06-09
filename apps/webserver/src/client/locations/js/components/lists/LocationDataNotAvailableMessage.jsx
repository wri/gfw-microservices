import React from 'react';
import { isAnalyzingStatus, isFailedList } from '../../utils/lists.utils';
import { locationsPage } from '../../../../common/js/config';

function LocationDataNotAvailableMessage({ list }) {
  const { list_status_id, lock_status, lock_user_id } = list;
  const isFailed = isFailedList(list);
  const isBeingAnalized = isAnalyzingStatus(list_status_id);
  const hasLockStatus = !!lock_status && !!lock_user_id;

  let message;
  if (hasLockStatus) {
    message = locationsPage.lists.tooltips.working;
  } else if (isBeingAnalized) {
    message = locationsPage.lists.tooltips.analyzing;
  } else if (isFailed) {
    message = locationsPage.lists.tooltips.failed;
  }

  return <h4 style={{ color: '#ed1846' }}>{message}</h4>;
}

export default LocationDataNotAvailableMessage;
