import { listStatusDescriptions } from '../../../../config/env/listStatuses.constants';
/**
 * Get - Is Diagnostic Status Draft
 * @param {Object} list - List details
 * @return {boolean} - Is Diagnostic Status Draft (true || false)
 */
export function getIsDiagnosticStatusDraft(list) {
  if (list) {
    const isDiagnosticStatusDraft = listStatusDescriptions.find(
      (status) => status.id === list.list_status_id
    );
    return isDiagnosticStatusDraft && isDiagnosticStatusDraft.status_name === 'Draft';
  }

  return false;
}

/**
 * Get List Status ID by status name
 *
 * @param {string} statusName - List Status ID (eg. ['Pending', 'Active', 'Inactive', 'Draft'])
 * @return {number} - List Status ID (eg. [1, 2, 3, 4])
 */
export function getListStatusIdByStatusName(statusName) {
  return listStatusDescriptions
    ? listStatusDescriptions.find(
        (status) => status.status_name.toLowerCase() === statusName.toLowerCase()
      ).id
    : undefined;
}
