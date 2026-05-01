import { BasicFieldsFileRequest } from '@wri-monorepos/sql';

const FALLBACK_LIST_NAME = 'list';

function normalizeListName(listName: string | undefined): string {
  if (!listName) {
    return FALLBACK_LIST_NAME;
  }
  // eslint-disable-next-line no-control-regex
  const trimmed = listName.replace(/[\x00-\x1F\x7F]/g, '').trim();
  return trimmed.length > 0 ? trimmed : FALLBACK_LIST_NAME;
}

function getSuffix(filters: BasicFieldsFileRequest): string {
  const { type, listView } = filters;

  if (type === 'input') {
    return 'input';
  }
  if (type === 'results') {
    return 'results';
  }
  if (type === 'afi' || type === 'afiVC') {
    return 'deforestation_kpis';
  }
  if (type === 'alerts') {
    return 'alerts';
  }
  if (type === 'ghg') {
    return 'ghg';
  }
  if (listView === 'forest_change') {
    return 'forest_change_analysis';
  }
  if (listView === 'commodity_risk') {
    return 'palm_risk_analysis';
  }
  return '';
}

export function getDownloadFilename(filters: BasicFieldsFileRequest): string {
  const listName = normalizeListName(filters.listName);
  const suffix = getSuffix(filters);
  const base = suffix ? `${listName}_${suffix}` : listName;
  return `${base}.zip`;
}
