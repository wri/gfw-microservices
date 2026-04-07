const CACHE_KEY = 'analysesLastModified';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let pendingRequest = null;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage full or unavailable
  }
}

export function invalidateAnalysesLastModifiedCache() {
  localStorage.removeItem(CACHE_KEY);
  pendingRequest = null;
}

export function fetchEnrichedAnalysisStatuses(listId) {
  return Promise.all([
    fetch(`/api/list/${listId}/selectedAnalyses`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json()),
    fetchAnalysesLastModified(),
  ]).then(([selectedAnalyses, lastModifiedData]) => {
    const lastModifiedMap = new Map(lastModifiedData?.map(({ id, last_run }) => [id, last_run]));
    return selectedAnalyses?.map((analysis) => ({
      ...analysis,
      analysisIdLastModifed: lastModifiedMap.get(analysis.analysisId),
    }));
  });
}

export function fetchAnalysesLastModified() {
  const cached = readCache();
  if (cached) {
    return Promise.resolve(cached);
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = fetch('/analyses-last-modified', {
    method: 'GET',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((data) => {
      writeCache(data);
      pendingRequest = null;
      return data;
    })
    .catch((error) => {
      pendingRequest = null;
      throw error;
    });

  return pendingRequest;
}
