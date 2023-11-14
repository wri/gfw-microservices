import { listStatus } from '../../../../config/env/listStatuses.constants';
/**
 * Get - Is Diagnostic Status Draft
 * @param {Object} list - List details
 * @return {boolean} - Is Diagnostic Status Draft (true || false)
 */

export function getIsDiagnosticStatusDraft(list) {
  const { Draft } = listStatus;

  if (list && list.list_status_id === Draft) {
    return true;
  }

  return false;
}
