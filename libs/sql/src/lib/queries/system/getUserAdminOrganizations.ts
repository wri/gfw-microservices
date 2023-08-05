/**
 * This query is used to get all the organizations where the user is administrator.
 * The command requires the following parameters:
 * @email AS NVARCHAR(250),
 */

export const getUserAdminOrganizations = `DECLARE @ORG_LIST AS nvarchar(max);
DECLARE @SQL AS nvarchar(max);
DECLARE @POS INT
DECLARE @LEN INT
DECLARE @ADMIN_ID INT
DECLARE @DB AS nvarchar(max);
DECLARE @SQL_OUTPUT AS nvarchar(max);
DECLARE @ACCESS_LEVEL_ID INT
DECLARE @myTableVariable TABLE (name varchar(255))
DECLARE @VALUE AS nvarchar(250);
    SELECT @ORG_LIST = STRING_AGG(ur.organization_id,',') FROM [dbo].[UserRoutes] ur WHERE ur.user_email = @email;

    SELECT @ADMIN_ID = al.id FROM [dbo].[AccessLevels] al WHERE al.accesslevel_name = 'Administrator';

    Set @SQL='SELECT @DB_OUTPUT = STRING_AGG(org.organization_db,'','') FROM [dbo].[Organizations] org WHERE org.id in ('+@ORG_LIST+')'

    EXEC sp_executesql @SQL, N'@DB_OUTPUT nvarchar(max) OUTPUT' , @DB_OUTPUT=@DB OUTPUT;

    SET @SQL = N'USE [{DATABASE}]; SELECT @ACCESS_LEVELOUT = us.access_level_id FROM [dbo].[Users] us WHERE us.email = ''{USER-EMAIL}''';

    set @POS = 0
    set @LEN = 0

    -- add comma at end so single clientStore follow same loop and last entry in list is processed
	set @DB = @DB + ','

    print @DB
    WHILE CHARINDEX(',', @DB, @POS+1)>0
    BEGIN
        set @LEN = CHARINDEX(',', @DB, @POS+1) - @POS
        set @value = SUBSTRING(@DB, @POS, @LEN)
        SET @SQL_OUTPUT = REPLACE(@SQL, '{DATABASE}', @value)
        SET @SQL_OUTPUT = REPLACE(@SQL_OUTPUT, '{USER-EMAIL}', @email)
        SET @ACCESS_LEVEL_ID = -1;

        BEGIN TRY
            EXEC sp_executesql @SQL_OUTPUT, N'@ACCESS_LEVELOUT INT OUTPUT' , @ACCESS_LEVELOUT=@ACCESS_LEVEL_ID OUTPUT;
        END TRY
        BEGIN CATCH
            SET @ACCESS_LEVEL_ID = -1
        END CATCH


        IF @ACCESS_LEVEL_ID = @ADMIN_ID
        BEGIN
            insert into @myTableVariable values (@VALUE)
        END
        SET @POS = CHARINDEX(',', @DB, @POS+@LEN) +1
    END

    SELECT org.id, org.organization_db, org.organization_status_id, org.organization_name FROM [dbo].[Organizations] org INNER JOIN @myTableVariable t on org.organization_db = t.name`;

export class UserAdminOrganization {
  id: number;
  organization_name: string;
  organization_status_id: number;
  organization_db: string;
}
