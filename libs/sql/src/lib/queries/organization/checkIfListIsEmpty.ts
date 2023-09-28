export const checkIfListIsEmpty = `
BEGIN
  DECLARE @listLocationTableName NVARCHAR(1000);
  DECLARE @SQL NVARCHAR(1000);

  SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @list_id;

  DECLARE @TEMPLATE NVARCHAR(1000) = 'DECLARE @DataCount AS INT = 0;
                SELECT @DataCount = COUNT(*) FROM [{TABLE_NAME}];
                SELECT CASE WHEN @DataCount = 0 THEN 1 ELSE 0 END AS isListEmpty'; -- Calculate isListEmpty based on @DataCount

  SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @listLocationTableName);

  DECLARE @isListEmpty BIT; -- Declare a variable to store the result as a boolean

  EXEC sp_executesql @SQL,
            N'@isListEmpty BIT OUTPUT', -- Define @isListEmpty as an output parameter
            @isListEmpty OUTPUT; -- Capture the output value

  SELECT @isListEmpty AS isListEmpty;
END
`;
