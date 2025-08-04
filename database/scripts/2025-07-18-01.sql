USE [gfwpro];
GO
SET NOCOUNT ON;

/*─────────────────────────────────────────────────────────────*
  Variables for both routing logic and the extra user columns
 *─────────────────────────────────────────────────────────────*/
DECLARE @userEmail        NVARCHAR(50),
        @hasAccess        BIT,
        @first_name       NVARCHAR(35),
        @middle_initial   NVARCHAR(2),
        @last_name        NVARCHAR(35),
        @phone            VARCHAR(50),
        @title_id         INT,
        @other_title      NVARCHAR(150),
        @user_status_id   INT;               -- maps to Users.status_id

DECLARE @dbName SYSNAME,
        @orgId  INT,
        @sql    NVARCHAR(MAX);

/*─────────────────────────────────────────────────────────────*
  Cursor over the root table – bring in every column we need
 *─────────────────────────────────────────────────────────────*/
DECLARE user_cursor CURSOR FOR
SELECT  user_email,
        has_customer_access,
        first_name,
        middle_initial,
        last_name,
        phone,
        title_id,
        other_title,
        user_status_id
FROM dbo.GFWProRootUserRoutes;

OPEN  user_cursor;
FETCH NEXT FROM user_cursor INTO
      @userEmail,
      @hasAccess,
      @first_name,
      @middle_initial,
      @last_name,
      @phone,
      @title_id,
      @other_title,
      @user_status_id;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '------------------------------------------';
    PRINT 'Processing user: ' + @userEmail
          + ' (Access: ' + RTRIM(CAST(@hasAccess AS VARCHAR)) + ')';

    /*─────────────────────────────────────────────────────────*
      Cursor over every online clientstore-<X> database
     *─────────────────────────────────────────────────────────*/
    DECLARE db_cursor CURSOR FOR
    SELECT name
    FROM   sys.databases
    WHERE  name LIKE 'clientstore-%'
      AND  state_desc = 'ONLINE';

    OPEN  db_cursor;
    FETCH NEXT FROM db_cursor INTO @dbName;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        /* organisation-id that corresponds to this clientstore db */
        SELECT @orgId = o.id
        FROM   dbo.Organizations o
        WHERE  o.organization_db = @dbName;

        /*-------------------------------------------------------*
          GRANT path → ensure user exists & is_system_user = 1
         *-------------------------------------------------------*/
        IF @hasAccess = 1
        BEGIN
            SET @sql = N'
              IF EXISTS ( 
                SELECT 1 FROM   ' + QUOTENAME(@dbName) + N'.dbo.Users
                WHERE  email = @e AND is_system_user = 1 
              )
              BEGIN
                PRINT N''[OK] [' + REPLACE(@dbName,'''','''''') + N'] '' + @e + N'' already exists as system user.'';
              END
              ELSE IF EXISTS ( 
                SELECT 1 FROM  ' + QUOTENAME(@dbName) + N'.dbo.Users
                WHERE  email = @e 
              )
              BEGIN
                  UPDATE ' + QUOTENAME(@dbName) + N'.dbo.Users
                  SET    is_system_user = 1
                  WHERE  email = @e;

                  PRINT N''[UPD] [' + REPLACE(@dbName,'''','''''') + N'] Updated user '' + @e + N'' to is_system_user = 1.'';
              END
              ELSE
              BEGIN
                  INSERT INTO ' + QUOTENAME(@dbName) + N'.dbo.Users(first_name, middle_initial, last_name, email,
                          phone, title_id, other_title,
                          access_level_id, status_id,
                          email_subscription, is_system_user )
                  VALUES ( @fn, @mi, @ln, @e,
                          @ph, @ttl, @oth,
                          0,          @sts,
                          0,          1 );

                  PRINT N''[INS] [' + REPLACE(@dbName,'''','''''') + N'] Inserted user '' + @e + N'' as system user.'';
              END';

            EXEC sp_executesql
                 @sql,
                 N'@e  NVARCHAR(50),
                   @fn NVARCHAR(35),
                   @mi NVARCHAR(2),
                   @ln NVARCHAR(35),
                   @ph VARCHAR(50),
                   @ttl INT,
                   @oth NVARCHAR(150),
                   @sts INT',
                 @e   = @userEmail,
                 @fn  = @first_name,
                 @mi  = @middle_initial,
                 @ln  = @last_name,
                 @ph  = @phone,
                 @ttl = @title_id,
                 @oth = @other_title,
                 @sts = @user_status_id;

            -- UserRoutes check & insert if missing
            IF @orgId IS NOT NULL
            BEGIN
              IF EXISTS ( 
                SELECT 1 FROM   dbo.UserRoutes
                WHERE  user_email      = @userEmail AND  organization_id = @orgId 
              )
                PRINT '[OK] [UserRoutes] ' + @userEmail + ' already linked to org ID ' + CAST(@orgId AS NVARCHAR);
              ELSE
              BEGIN
                INSERT INTO dbo.UserRoutes (user_email, organization_id, organization_user_id, organization_user_status_id)
                VALUES ( @userEmail, @orgId, 0, 0 );
                PRINT '[INS] [UserRoutes] Inserted link: ' + @userEmail + ' -> org ID ' + CAST(@orgId AS NVARCHAR);
              END
            END
        END
        ELSE
        BEGIN
          -- Delete user if exists
          SET @sql = N'
            IF EXISTS ( 
              SELECT 1 FROM   ' + QUOTENAME(@dbName) + '.dbo.Users WHERE  email = @e
            )
            BEGIN
                DELETE FROM ' + QUOTENAME(@dbName) + '.dbo.Users
                WHERE  email = @e;

                PRINT N''[DEL] [' + REPLACE(@dbName,'''','''''') + N'] Deleted user '' + @e + N'''';
            END';

            EXEC sp_executesql @sql, N'@e NVARCHAR(50)', @e = @userEmail;

            -- Delete from UserRoutes if exists
            IF @orgId IS NOT NULL
            BEGIN
                IF EXISTS ( 
                  SELECT 1 FROM   dbo.UserRoutes
                  WHERE  user_email      = @userEmail AND  organization_id = @orgId 
                )
                BEGIN
                  DELETE FROM dbo.UserRoutes
                  WHERE  user_email      = @userEmail AND  organization_id = @orgId;
                  PRINT '[DEL] [UserRoutes] Deleted: ' + @userEmail + ' from org ID ' + CAST(@orgId AS NVARCHAR);
                END
            END
        END

        FETCH NEXT FROM db_cursor INTO @dbName;
    END 

    CLOSE db_cursor;
    DEALLOCATE db_cursor;

    FETCH NEXT FROM user_cursor INTO
          @userEmail,
          @hasAccess,
          @first_name,
          @middle_initial,
          @last_name,
          @phone,
          @title_id,
          @other_title,
          @user_status_id;
END

CLOSE user_cursor;
DEALLOCATE user_cursor;

-- Show any additional stale UserRoutes rows (optional final check)
PRINT '--- Checking for stale UserRoutes entries ---';
SELECT *
FROM   dbo.UserRoutes UR
LEFT JOIN dbo.GFWProRootUserRoutes GR
  ON UR.user_email = GR.user_email
WHERE  GR.has_customer_access = 0
  OR  GR.user_email IS NULL;
GO
