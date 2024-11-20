/**
 * Set the location URL and expiration date for the file generated for specific list with Verifiable Credentials type
 * @listId INT,
 * @analysisId VARCHAR(10),
 * @location VARCHAR(255),
 * @expirationDate DATE,
 * @bundleCreationTime DATE,
 */
export const setS3UrlAndExpirationDateVC = `
IF EXISTS (SELECT 1 FROM [dbo].[ListsAnalysisStatus] WHERE listID = @listId AND AnalysisID = @analysisId)
BEGIN
    UPDATE [dbo].[ListsAnalysisStatus]
    SET s3_url = @location, expiration_time = @expirationDate, bundle_creation_time = @bundleCreationTime, UpdateTime = GETDATE()
    WHERE listID = @listId AND AnalysisID = @analysisId
END
ELSE
BEGIN
    INSERT INTO [dbo].[ListsAnalysisStatus] (listID, AnalysisID, Status, ErrorInfo, UpdateTime, s3_url, expiration_time, bundle_creation_time)
    VALUES (@listId, @analysisID, 2, '', GETDATE(), @location, @expirationDate, @bundleCreationTime)
END
`;
