export const updateUser = `

-- Update User in the Users Tables.
UPDATE Users SET
first_name = @firstName,
middle_initial = @mi,
last_name = @lastName,
email = @email,
phone = @phone,
title_id = @titleId,
other_title = @other_title,
access_level_id = ISNULL(@accessLevelId, access_level_id),
email_subscription = @email_subscription
WHERE id = @userId

-- DELETE Old Commodity Data.
DELETE FROM UserCommodities WHERE user_id = @userID

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
  set @pos = @len + 1
END
SET @strCurId = SUBSTRING(@commodity_ids, @pos, LEN(@commodity_ids) - @pos + 1)
SET @nCurId = CAST(@strCurId AS INT)
INSERT INTO [dbo].[UserCommodities] VALUES(@userID, @nCurId)

-- DELETE Old Geography Data.
DELETE FROM UserGeographies WHERE user_id = @userID

-- Add Geography Data.
SET @pos = 1
WHILE CHARINDEX(',', @geography_ids, @pos) > 0
BEGIN
  SET @len = CHARINDEX(',', @geography_ids, @pos)
  SET @strCurId = SUBSTRING(@geography_ids, @pos, @len - @pos)
  SET @nCurId = CAST(@strCurId AS INT)
  INSERT INTO [dbo].[UserGeographies] VALUES(@userID, @nCurId)
  set @pos = @len + 1
END
SET @strCurId = SUBSTRING(@geography_ids, @pos, LEN(@geography_ids) - @pos + 1)
SET @nCurId = CAST(@strCurId AS INT)
INSERT INTO [dbo].[UserGeographies] VALUES(@userID, @nCurId)

SELECT @userID AS NewUserID
`;
