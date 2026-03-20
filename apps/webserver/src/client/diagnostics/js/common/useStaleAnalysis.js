import { useState, useEffect } from 'react';
import { isAnalysisStale } from '../../../listDetails/js/components/lists/ListDetails/StaleAnalysisBanner';
import { fetchEnrichedAnalysisStatuses } from '../../../common/js/utils/selectedAnalysesCache';

export default function useStaleAnalysis(listId, analysisId) {
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    if (!listId) {
      return;
    }

    fetchEnrichedAnalysisStatuses(listId)
      .then((enrichedStatuses) => {
        const currentAnalysis = enrichedStatuses?.find((item) => item.analysisId === analysisId);
        if (!currentAnalysis) {
          return;
        }
        setIsStale(isAnalysisStale(currentAnalysis));
      })
      .catch((error) => {
        console.warn('Failed to fetch stale analysis data', error);
      });
  }, [listId, analysisId]);

  return isStale;
}
