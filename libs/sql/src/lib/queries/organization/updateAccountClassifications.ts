/**
 * @param classification_ids VARCHAR(200)
 */
export const updateAccountClassifications = `
-- Remove old classifications.
DELETE FROM AccountClassifications

--Add new classifications.
DECLARE @pos INT
DECLARE @len INT
DECLARE @strClassificationId varchar(20)
DECLARE @nClassificationId INT

SET @pos = 1
WHILE CHARINDEX(',', @classification_ids, @pos) > 0
BEGIN
  SET @len = CHARINDEX(',', @classification_ids, @pos)
  SET @strClassificationId = SUBSTRING(@classification_ids, @pos, @len - @pos)
  SET @nClassificationId = CAST(@strClassificationId AS INT)
  INSERT INTO AccountClassifications VALUES(@nClassificationId)
  set @pos = @len + 1
END
SET @strClassificationId = SUBSTRING(@classification_ids, @pos, LEN(@classification_ids) - @pos + 1)
SET @nClassificationId = CAST(@strClassificationId AS INT)
INSERT INTO AccountClassifications VALUES(@nClassificationId)

`;
