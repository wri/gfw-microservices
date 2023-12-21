import React, { useEffect, useState } from 'react';

export const getLatestCommits = async () => {
  try {
    const response = await fetch(`/api/latest_commit`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return {
      EAPI: "N/A",
      LD: "N/A",
      LP: "N/A",
      WEB: "N/A"
    };
  }
};

function LatestCommits({ setIsLoading }) {
  const [latestCommitsData, setLatestCommitsData] = useState({
    EAPI: "N/A",
    LD: "N/A",
    LP: "N/A",
    WEB: "N/A"
  });

  const commitfFormat = (commitName) => {
    if(commitName == "N/A") {
      return 'can not show the latest commit'
    }

    if(commitName == "dev") {
      return "you are running a local server use 'git log' to see your last commits";
    }

    return commitName;
  }

  useEffect(() => {
    getLatestCommits().then((data) => {
      setLatestCommitsData(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <h3>commits</h3>
      <p>
        <label>API:</label> <br />
        {commitfFormat(latestCommitsData['EAPI'])}
      </p>
      <p>
        <label>Web Server:</label> <br />
         {commitfFormat(latestCommitsData['WEB'])}
      </p>
      <p>
        <label>List Downloader:</label> <br />
         {commitfFormat(latestCommitsData['LD'])}
      </p>
      <p>
        <label>List Processing:</label> <br />
         {commitfFormat(latestCommitsData['LP'])}
      </p>
    </>

  );
}

export default LatestCommits;
