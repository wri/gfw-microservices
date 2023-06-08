const getLocationsCount = `DECLARE @organization_db NVARCHAR(200)
DECLARE @TEMPLATE NVARCHAR(1000)
DECLARE @SQL NVARCHAR(2000)

SET @organization_db = @org_db

SET @TEMPLATE = '
  DECLARE @totalCount INT
  DECLARE @investmentCount INT
  DECLARE @commodityCount INT

  --Get the Total Count of all Lists.
  SELECT @totalCount = SUM(L.list_locations_count)
  FROM [{DATABASENAME}].dbo.Lists AS L
  JOIN Templates AS T ON L.template_id = T.id
  JOIN LocationType LT ON T.location_type_id = LT.id

  --Get the Investment Count of all Lists.
  SELECT @investmentCount = SUM(L.list_locations_count)
  FROM [{DATABASENAME}].dbo.Lists AS L
  JOIN Templates AS T ON L.template_id = T.id
  JOIN LocationType LT ON T.location_type_id = LT.id
  WHERE T.location_type_id = 1

  --Get the Total Count of all Lists.
  SELECT @commodityCount = SUM(L.list_locations_count)
  FROM [{DATABASENAME}].dbo.Lists AS L
  JOIN Templates AS T ON L.template_id = T.id
  JOIN LocationType LT ON T.location_type_id = LT.id
  WHERE T.location_type_id = 2

  SELECT @totalCount AS TotalCount, @investmentCount AS InvestmentCount, @commodityCount AS CommodityCount
'
SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db)
EXEC sp_executesql @SQL`;

export { getLocationsCount };
