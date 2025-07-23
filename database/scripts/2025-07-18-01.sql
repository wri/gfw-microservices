USE [gfwpro];
GO

SET NOCOUNT ON;

DECLARE @userEmail NVARCHAR(50), @hasAccess BIT;
DECLARE @dbName SYSNAME, @orgId INT;
DECLARE @sql NVARCHAR(MAX);

-- Cursor to loop through all entries in GFWProRootUserRoutes
DECLARE user_cursor CURSOR FOR
SELECT user_email, has_customer_access
FROM dbo.GFWProRootUserRoutes;

OPEN user_cursor;
FETCH NEXT FROM user_cursor INTO @userEmail, @hasAccess;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '------------------------------------------';
    PRINT 'Processing user: ' + @userEmail + ' (Access: ' + RTRIM(CAST(@hasAccess AS VARCHAR)) + ')';

    -- Loop through all clientstore databases
    DECLARE db_cursor CURSOR FOR
    SELECT name
    FROM sys.databases
    WHERE name LIKE 'clientstore-%' AND state_desc = 'ONLINE';

    OPEN db_cursor;
    FETCH NEXT FROM db_cursor INTO @dbName;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Get organization_id for this clientstore
        SELECT @orgId = o.id
        FROM dbo.Organizations o
        WHERE o.organization_db = @dbName;

        IF @hasAccess = 1
        BEGIN
            -- Check if user exists and if is_system_user needs update/insert
            SET @sql = N'
                IF EXISTS (
                    SELECT 1 FROM ' + QUOTENAME(@dbName) + N'.dbo.Users
                    WHERE email = @e AND is_system_user = 1
                )
                    PRINT N''[OK] [' + REPLACE(@dbName, '''', '''''') + N'] '' + @e + N'' already exists as system user.'';
                ELSE IF EXISTS (
                    SELECT 1 FROM ' + QUOTENAME(@dbName) + N'.dbo.Users
                    WHERE email = @e
                )
                BEGIN
                    UPDATE ' + QUOTENAME(@dbName) + N'.dbo.Users
                    SET is_system_user = 1
                    WHERE email = @e;
                    PRINT N''[UPD] [' + REPLACE(@dbName, '''', '''''') + N'] Updated user '' + @e + N'' to is_system_user = 1.'';
                END
                ELSE
                BEGIN
                    INSERT INTO ' + QUOTENAME(@dbName) + N'.dbo.Users (email, is_system_user)
                    VALUES (@e, 1);
                    PRINT N''[INS] [' + REPLACE(@dbName, '''', '''''') + N'] Inserted user '' + @e + N'' as system user.'';
                END
            ';
            EXEC sp_executesql @sql, N'@e NVARCHAR(50)', @e = @userEmail;

            -- UserRoutes check & insert if missing
            IF @orgId IS NOT NULL
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM dbo.UserRoutes
                    WHERE user_email = @userEmail AND organization_id = @orgId
                )
                    PRINT '[OK] [UserRoutes] ' + @userEmail + ' already linked to org ID ' + CAST(@orgId AS NVARCHAR);
                ELSE
                BEGIN
                    INSERT INTO dbo.UserRoutes (user_email, organization_id, organization_user_id, organization_user_status_id)
                    VALUES (@userEmail, @orgId, 0, 0); -- Adjust IDs if necessary
                    PRINT '[INS] [UserRoutes] Inserted link: ' + @userEmail + ' -> org ID ' + CAST(@orgId AS NVARCHAR);
                END
            END
        END
        ELSE
        BEGIN
            -- Delete user if exists
            SET @sql = N'
                IF EXISTS (
                    SELECT 1 FROM ' + QUOTENAME(@dbName) + '.dbo.Users
                    WHERE email = @e
                )
                BEGIN
                    DELETE FROM ' + QUOTENAME(@dbName) + '.dbo.Users
                    WHERE email = @e;
                    PRINT N''[DEL] [' + REPLACE(@dbName, '''', '''''') + N'] Deleted user '' + @e + N''''; 
                END
            ';
            EXEC sp_executesql @sql, N'@e NVARCHAR(50)', @e = @userEmail;

            -- Delete from UserRoutes if exists
            IF @orgId IS NOT NULL
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM dbo.UserRoutes
                    WHERE user_email = @userEmail AND organization_id = @orgId
                )
                BEGIN
                    DELETE FROM dbo.UserRoutes
                    WHERE user_email = @userEmail AND organization_id = @orgId;
                    PRINT '[DEL] [UserRoutes] Deleted: ' + @userEmail + ' from org ID ' + CAST(@orgId AS NVARCHAR);
                END
            END
        END

        FETCH NEXT FROM db_cursor INTO @dbName;
    END

    CLOSE db_cursor;
    DEALLOCATE db_cursor;

    FETCH NEXT FROM user_cursor INTO @userEmail, @hasAccess;
END

CLOSE user_cursor;
DEALLOCATE user_cursor;

-- Show any additional stale UserRoutes rows (optional final check)
PRINT '--- Checking for stale UserRoutes entries ---';
SELECT *
FROM dbo.UserRoutes UR
LEFT JOIN dbo.GFWProRootUserRoutes GR
  ON UR.user_email = GR.user_email
WHERE GR.has_customer_access = 0
   OR GR.user_email IS NULL;