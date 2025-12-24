import { USER_STATUS, USER_STATUS_LABELS } from '../../../../config/env/userStatuses.constants';

/**
 * Converts comma-separated IDs string into array of integers
 */
export const parseMultiIds = (csv) => {
  if (!csv) {
    return [];
  }
  return csv.split(',').map((v) => parseInt(v, 10));
};

/**
 * Builds selected items for multi-select from IDs and source data
 */
export const buildSelectedMulti = (idsArray, sourceData, labelKey = 'geography_name') => {
  if (!sourceData || !sourceData.length) {
    return idsArray.map((id) => ({ label: '', value: id }));
  }
  return idsArray.map((id) => {
    const datum = sourceData.find((d) => d.id === id);
    return datum ? { label: datum[labelKey], value: datum.id } : { label: '', value: id };
  });
};

/**
 * Transforms title data into dropdown options
 */
export const dropdownTitleOptions = (titles) => {
  return (titles || []).map((data) => ({ value: data.id, label: data.title }));
};

/**
 * Transforms access level data into dropdown options
 */
export const buildAccessLevelOptions = (accessLevels) => {
  return (accessLevels || []).map((data) => ({ value: data.id, label: data.name }));
};

/**
 * Transforms status data into dropdown options
 */
export const dropdownUserStatusOptions = (statusArr) => {
  return (statusArr || []).map((s) => ({ value: s.id, label: s.name, name: s.name }));
};

/**
 * Gets user title option from ID
 */
export const getUserTitle = (titleId, titles) => {
  const parsed = parseInt(String(titleId), 10);
  if (parsed) {
    const userTitle = (titles || []).find((t) => parsed === t.id);
    if (userTitle) {
      return { value: userTitle.id, label: userTitle.title };
    }
  }
  return 'Select...';
};

/**
 * Gets user access level option from ID
 */
export const getUserAccessLevel = (accessLevelId, accessLevelData) => {
  const parsed = parseInt(String(accessLevelId), 10);
  if (parsed) {
    const userAccessLevel = (accessLevelData || []).find((a) => parsed === a.id);
    if (userAccessLevel) {
      return { value: userAccessLevel.id, label: userAccessLevel.name };
    }
  }
  return 'Select...';
};

/**
 * Gets user status option from ID
 */
export const getUserStatus = (statusId, statusData) => {
  const parsed = parseInt(String(statusId), 10);
  if (parsed) {
    const userStatus = (statusData || []).find((s) => parsed === s.id);
    if (userStatus) {
      return {
        value: userStatus.id,
        label: userStatus.name,
        name: userStatus.name,
      };
    }
  }
  return {
    value: USER_STATUS.Active,
    label: USER_STATUS_LABELS[USER_STATUS.Active],
    name: USER_STATUS_LABELS[USER_STATUS.Active],
  };
};

/**
 * Creates geography option for react-select
 */
export const createGeogOptions = (option) => ({
  label: option.geography_name,
  value: option.id,
});

/**
 * Creates commodity option for react-select
 */
export const createCommOptions = (option) => ({
  label: option.commmodity_name,
  value: option.id,
});
