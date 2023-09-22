const arrayOfFailedListsIdMock = [];

export default function getAnalysisLimitListsStatus() {
  /**
   * @summary Fetch from the upcoming backend. Table [ListsAnalysisStatus]
   * @See {@link https://gfw.atlassian.net/browse/GPV-2040}
   */
  /* 
    fetch('/backendForAnalysisLimistsStatus', {
    method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    }).then((res) => res.json());
   */
  return new Promise((resolve) => {
    // resolve array of ids with the lists that errorer by limits usage
    resolve(arrayOfFailedListsIdMock);
  });
}
