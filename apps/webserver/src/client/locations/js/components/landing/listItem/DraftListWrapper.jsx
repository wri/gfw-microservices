import React, { useState } from 'react';
import AnalyzingList from './AnalyzingList';
import DraftList from './DraftList';
import { requestGeoTrellisAnalyzeList } from '../../../utils/request.utils';

function DraftListWrapper(props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const submitForAnalysis = () => {
    const { list } = props;
    setIsAnalyzing(true);
    return requestGeoTrellisAnalyzeList(list)
      .then(() => {
        gtag('event', 'Submit List', {
          event_category: 'Submit',
          event_label: 'User submits a list for analysis',
        });
        gtag('event', 'Submit List', {
          event_category: 'Submit',
          event_label: 'User submits a list from landing page',
        });
      })
      .catch((error) => {
        setIsAnalyzing(false);
        // TODO: Get details what to do after list submission fails
        console.log(error);
      });
  };

  return (
    <>
      {isAnalyzing ? (
        <AnalyzingList {...props} />
      ) : (
        <DraftList {...props} submitForAnalysis={submitForAnalysis} />
      )}
    </>
  );
}

export default DraftListWrapper;
