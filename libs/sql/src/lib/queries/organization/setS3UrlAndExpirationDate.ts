/**
 * Set the location URL and expiration date for the file generated for specific list
 * @location VARCHAR(255),
 * @expirationDate DATE,
 * @listId INT,
 * @analysisId VARCHAR(10)
 */

export const setS3UrlAndExpirationDate = `UPDATE [dbo].[ListsAnalysisStatus] SET s3_url = @location,expiration_time=@expirationDate WHERE listID = @listId  AND AnalysisID = @analysisId`;
