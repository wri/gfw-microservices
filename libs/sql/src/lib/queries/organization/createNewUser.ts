/**
 * @param mi NVARCHAR(2)
 * @param lastName NVARCHAR(35)
 * @param email NVARCHAR(50)
 * @param phone NVARCHAR(50)
 * @param titleId INT
 * @param other_title NVARCHAR(150)
 * @param accessLevelId INT
 * @param statusId INT
 * @param email_subscription BIT
 * @param language NCHAR(2)
 * @param commodity_ids VARCHAR(200)
 * @param geography_ids VARCHAR(200)
 * @param viirs_email_frequency INT = 0
 * @param glad_email_frequency INT = 0
 * @param forma_email_frequency INT = 0
 * @param terrai_email_frequency INT = 0
 * @param gran_chaco_email_frequency INT = 0
 */
export const createNewUser = `
-- Insert User into Users Tables.
INSERT INTO Users(first_name, middle_initial, last_name,
    email, phone, title_id, other_title, access_level_id, status_id, is_system_user, email_subscription,
    viirs_email_frequency, glad_email_frequency, forma_email_frequency, terrai_email_frequency, gran_chaco_email_frequency, language)
VALUES(@firstName, @mi, @lastName,
    @email, @phone, @titleId, @other_title, @accessLevelId, @statusId, 0, @email_subscription,
    @viirs_email_frequency, @glad_email_frequency, @forma_email_frequency, @terrai_email_frequency, @gran_chaco_email_frequency, @language)

DECLARE @userID INT
SET @userID = SCOPE_IDENTITY()

-- Add Commodity Data.
DECLARE @pos INT
DECLARE @len INT
DECLARE @strCurId varchar(20)
DECLARE @nCurId INT

SET @pos = 1
WHILE CHARINDEX(',', @commodity_ids, @pos) > 0
BEGIN
    SET @len = CHARINDEX(',', @commodity_ids, @pos)
    SET @strCurId = SUBSTRING(@commodity_ids, @pos, @len - @pos)
    SET @nCurId = CAST(@strCurId AS INT)
    INSERT INTO [dbo].[UserCommodities] VALUES(@userID, @nCurId)
    SET @pos = @len + 1
END
SET @strCurId = SUBSTRING(@commodity_ids, @pos, LEN(@commodity_ids) - @pos + 1)
SET @nCurId = CAST(@strCurId AS INT)
INSERT INTO [dbo].[UserCommodities] VALUES(@userID, @nCurId)

-- Add Geography Data.
SET @pos = 1
WHILE CHARINDEX(',', @geography_ids, @pos) > 0
BEGIN
    SET @len = CHARINDEX(',', @geography_ids, @pos)
    SET @strCurId = SUBSTRING(@geography_ids, @pos, @len - @pos)
    SET @nCurId = CAST(@strCurId AS INT)
    INSERT INTO [dbo].[UserGeographies] VALUES(@userID, @nCurId)
    SET @pos = @len + 1
END
SET @strCurId = SUBSTRING(@geography_ids, @pos, LEN(@geography_ids) - @pos + 1)
SET @nCurId = CAST(@strCurId AS INT)
INSERT INTO [dbo].[UserGeographies] VALUES(@userID, @nCurId)

SELECT @userID AS NewUserID
`;

export interface newUser {
  NewUserID: number;
}
