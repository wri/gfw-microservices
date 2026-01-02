import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { CircularProgress, Box } from '@mui/material';
import { fetchInfoBubble, saveInfoBubbleCache, getInfoBubbleCache } from './infoBubble.utils';

export default function InfoBubbleContent({ infoBubbleId }) {
  const [bubbleData, setBubbleData] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const infoBubbleList = getInfoBubbleCache();

    if (infoBubbleList && infoBubbleList[infoBubbleId]) {
      setBubbleData(infoBubbleList[infoBubbleId]);
      setIsLoading(false);
    } else {
      fetchInfoBubble(infoBubbleId)
        .then((data) => {
          setBubbleData(data);
          saveInfoBubbleCache(data, infoBubbleId);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <>
      {bubbleData && (
        <>
          <h3 className="bubble-title">{bubbleData.Title}</h3>

          {bubbleData['Why this Analysis?'] && <h4>Why this Analysis?</h4>}
          {bubbleData['Why this Analysis?'] && (
            <p dangerouslySetInnerHTML={{ __html: bubbleData['Why this Analysis?'] }}></p>
          )}

          {bubbleData['What this Section Explains'] && <h4>What this Section Explains</h4>}
          {bubbleData['What this Section Explains'] && (
            <p
              dangerouslySetInnerHTML={{ __html: marked(bubbleData['What this Section Explains']) }}
            ></p>
          )}

          {bubbleData["How it's Calculated"] && <h4>How it's Calculated</h4>}
          {bubbleData["How it's Calculated"] && (
            <p dangerouslySetInnerHTML={{ __html: marked(bubbleData["How it's Calculated"]) }}></p>
          )}

          {bubbleData.Notes && <h4>Notes</h4>}
          {bubbleData.Notes && (
            <p dangerouslySetInnerHTML={{ __html: marked(bubbleData.Notes) }}></p>
          )}
        </>
      )}
    </>
  );
}
