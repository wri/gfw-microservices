/**
 * Set the location URL and expiration date for the file generated for specific list with Verifiable Credentials type
 * @location VARCHAR(255),
 * @expirationDate DATE,
 * @bundleCreationTime DATE,
 * @listId INT,
 * @analysisId VARCHAR(10)
 */
export const setS3UrlAndExpirationDateVC = `
IF EXISTS (SELECT 1 FROM [dbo].[ListsAnalysisStatus] WHERE listID = @listId AND AnalysisID = 'AFIVC')
BEGIN
    UPDATE [dbo].[ListsAnalysisStatus]
    SET s3_url = @location, expiration_time = @expirationDate, bundle_creation_time = @bundleCreationTime
    WHERE listID = @listId AND AnalysisID = 'AFIVC'
END
ELSE
BEGIN
    INSERT INTO [dbo].[ListsAnalysisStatus] (listID, AnalysisID, s3_url, expiration_time, bundle_creation_time)
    VALUES (@listId, 'AFIVC', @location, @expirationDate, @bundleCreationTime)
END
`;
