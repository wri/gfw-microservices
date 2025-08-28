/**
 * @userID INT
 * @commodity_ids VARCHAR(200)
 */
export const updateUserCommodities = `
-- Remove old commodities for the user.
DELETE FROM UserCommodities WHERE user_id = @userID

--Add new commodities for the user.
DECLARE @pos INT
DECLARE @len INT
DECLARE @strCommoditiyId varchar(20)
DECLARE @nCommodityId INT

SET @pos = 1
WHILE CHARINDEX(',', @commodity_ids, @pos) > 0
BEGIN
	SET @len = CHARINDEX(',', @commodity_ids, @pos)
	SET @strCommoditiyId = SUBSTRING(@commodity_ids, @pos, @len - @pos)
	SET @nCommodityId = CAST(@strCommoditiyId AS INT)
	INSERT INTO UserCommodities(user_id, commodity_id) VALUES(@userID, @nCommodityId)
	SET @pos = @len + 1
END
SET @strCommoditiyId = SUBSTRING(@commodity_ids, @pos, LEN(@commodity_ids) - @pos + 1)
SET @nCommodityId = CAST(@strCommoditiyId AS INT)
INSERT INTO UserCommodities(user_id, commodity_id) VALUES(@userID, @nCommodityId)
`;
