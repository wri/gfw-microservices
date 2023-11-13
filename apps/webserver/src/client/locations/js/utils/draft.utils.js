import { listStatus } from '../../../../config/env/listStatuses.constants';
/**
 * Get - Is Diagnostic Status Draft
 * @param {Object} list - List details
 * @return {boolean} - Is Diagnostic Status Draft (true || false)
 */

export function getIsDiagnosticStatusDraft({ list_status_id }) {
  const { Draft } = listStatus;

  if (list_status_id && list_status_id === Draft) {
    return true;
  }

  return false;
}
