/**
 * @ListID      - the listID
 * @OptionOnly  - delete an analysis type that's an option/child of one analysisId
 */
export const deleteListAnalysisStatusBy = `
IF (@OptionOnly IS NOT NULL AND @OptionOnly <> 0)
    BEGIN
        UPDATE dbo.[ListsAnalysisStatus]
        SET [options] = NULL

        WHERE ListID = @ListID and AnalysisID <> 'GHG';
    END
ELSE
    BEGIN
        DELETE FROM dbo.[ListsAnalysisStatus]
        WHERE ListID = @ListID and AnalysisID <> 'GHG';
    END
`;
