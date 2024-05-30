import { listStatus } from '../../../../config/env/listStatuses.constants';
/**
 * Get - Is Diagnostic Status Draft
 * @param {Object} list - List details
 * @return {boolean} - Is Diagnostic Status Draft (true || false)
 */

export function getIsDiagnosticStatusDraft(list) {
  return list?.list_status_id === listStatus.Draft;
}

export function getIsDraftWithoutDiagnostic(list) {
  if (getIsDiagnosticStatusDraft(list) && !list.dashboard_last_results) {
    return true;
  }

  return false;
}
