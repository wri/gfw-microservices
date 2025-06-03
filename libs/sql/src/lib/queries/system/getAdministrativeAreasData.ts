/**
 * @param country NVARCHAR(150)
 * @param states NVARCHAR(MAX)
 * @param sub_states NVARCHAR(MAX)
 */
export const getAdministrativeAreasData = `
--Declare Variables.
DECLARE @SQL NVARCHAR(MAX)

--Setup query to filter results by country/state/substate.
SET @SQL = 'SELECT
        [id],[Location Name],[Country],[State],[Sub State],[Latitude],[Longitude],[Location Classification],[Size],[gadmid],[location_id]
      FROM
        [gfwpro].[dbo].[list-administrativeAreas36]
      WHERE
      Country = @country'

--Filter by states, if states are provided.
IF(LEN(@states) > 0)
BEGIN
  SET @SQL = @SQL + ' AND [State] IN (SELECT [value] FROM STRING_SPLIT(@states, '',''))'
END

--Filter by sub states, if sub states are provided.
IF(LEN(@sub_states) > 0)
BEGIN
  SET @SQL = @SQL + ' AND [Sub State] IN (SELECT [value] FROM STRING_SPLIT(@sub_states, '',''))'
END

--Execute Query.
 EXEC sp_executesql @SQL,
            N'@country NVARCHAR(150), @states NVARCHAR(MAX), @sub_states NVARCHAR(MAX)',
            @country, @states, @sub_states
`;
