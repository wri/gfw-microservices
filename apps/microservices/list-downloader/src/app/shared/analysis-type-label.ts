import { BasicFieldsFileRequest } from '@wri-monorepos/sql';

/**
 * Returns a human-readable analysis type label for the given file request,
 * matching the short labels used in the analysis success email
 * (e.g. "Post-2000", "Post-2020", "Alerts").
 *
 * Returns undefined when the request does not correspond to a specific
 * analysis type (e.g. raw input/results downloads).
 */
export function getAnalysisTypeLabel(filters: BasicFieldsFileRequest): string | undefined {
  const { type, listView } = filters;

  if (type === 'afi' || type === 'afiVC') {
    return 'Post-2020';
  }
  if (type === 'alerts') {
    return 'Alerts';
  }
  if (type === 'ghg') {
    return 'GHG';
  }
  if (listView === 'forest_change') {
    return 'Post-2000';
  }
  if (listView === 'commodity_risk') {
    return 'Palm Risk';
  }
  return undefined;
}
