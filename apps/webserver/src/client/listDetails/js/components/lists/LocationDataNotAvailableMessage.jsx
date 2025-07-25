import { isAnalyzingStatus, isFailedList } from '../../../../locations/js/utils/lists.utils';
import { locationsPage } from '../../../../common/js/config';

function LocationDataNotAvailableMessage({ list, isListSubmitedForAnalysis }) {
  const { list_status_id, lock_status } = list;
  const isFailed = isFailedList(list);
  const isBeingAnalized = isListSubmitedForAnalysis || isAnalyzingStatus(list_status_id);

  let message;
  if (isBeingAnalized) {
    message = locationsPage.lists.tooltips.analyzing;
  } else if (isFailed) {
    message = locationsPage.lists.tooltips.failed;
  }

  return <h4 style={{ color: '#ed1846' }}>{message}</h4>;
}

export default LocationDataNotAvailableMessage;
