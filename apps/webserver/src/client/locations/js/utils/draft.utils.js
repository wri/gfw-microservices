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
