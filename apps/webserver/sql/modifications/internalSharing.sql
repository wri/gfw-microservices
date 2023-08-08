DECLARE @db sysname
DECLARE @sql NVARCHAR(MAX)
DECLARE @TEMPLATE NVARCHAR(MAX)

SET @TEMPLATE = N'
DROP TABLE {DATABASE}.[dbo].[InternalShareRoutes]

CREATE TABLE {DATABASE}.[dbo].[InternalShareRoutes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[admin_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[list_id] [int] NOT NULL,
	[datetime] [datetime] NOT NULL,
 CONSTRAINT [PK_InternalShareRoutes] PRIMARY KEY CLUSTERED ([id] ASC)
 WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
 ON [PRIMARY]
) ON [PRIMARY]
'

-- Loop over all organizations
DECLARE db CURSOR FOR
SELECT name
FROM sys.databases d
WHERE
  (d.database_id > 4) AND /* No system databases */
  (d.state = 0) AND /* Online only */
  (d.is_distributor = 0) AND /* Not a distribution database */
  (d.is_read_only = 0) AND 
	(d.name <> 'gfwpro') AND
	(d.name <> 'logs-gfwpro')
OPEN db
FETCH NEXT FROM db INTO @db

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = REPLACE(@TEMPLATE, '{DATABASE}', QUOTENAME(@db))
    EXEC (@sql)
	FETCH NEXT FROM db INTO @db
END

CLOSE db
DEALLOCATE db

GO

ALTER PROCEDURE dbo.uspShareInternalList
	@admin_id INT,
	@user_id INT,
	@list_id INT,
	@datetime DATETIME
AS
	INSERT INTO InternalShareRoutes(admin_id, user_id, list_id, datetime) VALUES (@admin_id, @user_id, @list_id, @datetime);
GO

ALTER PROCEDURE dbo.uspActivateShareInternalList
	@admin_id INT,
	@user_id INT,
	@list_id INT,
	@datetime DATETIME
AS
	UPDATE InternalShareRoutes
	SET datetime = @datetime
	WHERE
		admin_id = @admin_id AND
		user_id = @user_id AND
		list_id = @list_id						
GO

ALTER PROCEDURE dbo.uspDeactivateShareInternalList
	@user_id INT,
	@list_id INT
AS
	DELETE FROM InternalShareRoutes
	WHERE
		user_id = @user_id AND
		list_id = @list_id
GO

ALTER PROCEDURE dbo.uspGetUserInternalShareLists
	@user_id INT
AS
	SELECT * FROM InternalShareRoutes
	WHERE
		admin_id = @user_id or
		user_id = @user_id
GO

ALTER PROCEDURE dbo.uspGetUserPendingInternalShareLists
	@user_id INT
AS
	SELECT * FROM InternalShareRoutes
	WHERE
		user_id = @user_id
GO

ALTER PROCEDURE dbo.uspAdminInternalLists
AS
	SELECT * FROM InternalShareRoutes
GO

CREATE PROCEDURE dbo.uspGetUsersInternalShareLists
	@list_id INT
AS
	SELECT * FROM InternalShareRoutes
	WHERE list_id = @list_id
GO

CREATE OR ALTER PROCEDURE dbo.uspDeactivateAllShareInternalList
	@user_id NVARCHAR(MAX),
	@list_id INT
AS
	DELETE FROM InternalShareRoutes
	WHERE
		list_id = @list_id AND
		user_id IN (SELECT value FROM STRING_SPLIT(@user_id, ','))

GO
							   
							   INSERT INTO [gfwpro].[dbo].[ActivityType] (activity_type_category_id, activity_type_name) VALUES(4, 'ListShared'), (4, 'ListUnShared'), (4, 'ListUnSharedWithAll')
							   
							   GO
