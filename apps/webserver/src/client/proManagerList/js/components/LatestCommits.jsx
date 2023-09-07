import React from 'react';

function LatestCommits({setIsLoading}) {
  setIsLoading(false);
  return (
    <h3>
      {process.env.LATEST_COMMIT}
    </h3>
  );
}

export default LatestCommits;
