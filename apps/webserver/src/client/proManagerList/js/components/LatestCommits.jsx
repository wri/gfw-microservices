import React from 'react';

function LatestCommits({ setIsLoading }) {
  setIsLoading(false);
  const latestCommitMessage = process.env.LATEST_COMMIT || 'can not show the latest commit';
  return <h3>{latestCommitMessage}</h3>;
}

export default LatestCommits;
