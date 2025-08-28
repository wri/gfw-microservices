/**
 * @userID INT
 * @geography_ids VARCHAR(200)
 */
export const updateUserGeographies = `
-- Remove old geographies for the user.
DELETE FROM UserGeographies WHERE user_id = @userID

DECLARE @pos INT
DECLARE @len INT
DECLARE @strGeographyId varchar(20)
DECLARE @nGeographyId INT

SET @pos = 1
WHILE CHARINDEX(',', @geography_ids, @pos) > 0
BEGIN
	SET @len = CHARINDEX(',', @geography_ids, @pos)
	SET @strGeographyId = SUBSTRING(@geography_ids, @pos, @len - @pos)
	SET @nGeographyId = CAST(@strGeographyId AS INT)
	INSERT INTO UserGeographies(user_id,geography_id) VALUES(@userID, @nGeographyId)
	SET @pos = @len +1
END
SET @strGeographyId = SUBSTRING(@geography_ids, @pos, LEN(@geography_ids) - @pos + 1)
SET @nGeographyId = CAST(@strGeographyId AS INT)
INSERT INTO UserGeographies(user_id,geography_id) VALUES(@userID, @nGeographyId)
`;
