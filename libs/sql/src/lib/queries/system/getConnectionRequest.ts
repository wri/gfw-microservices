export const getConnectionRequest = `DECLARE @SQL NVARCHAR(MAX)
DECLARE @id_status INT
DECLARE @Filters NVARCHAR(MAX) = ''

  SET @SQL = 'SELECT cr.id, cr.create_date, cr.id_source_organization, cr.id_target_organization, cr.source_email, cs1.edited_date, cs1.editor_email, cs1.id_status, cvs.status, cvs.description, orgSource.organization_name as ''source_organization'', orgTarget.organization_name as ''target_organization''' +
      '  FROM [dbo].[Connection_Request] cr ' +
      ' JOIN [dbo].[Organizations] orgSource on cr.id_source_organization = orgSource.id' +
      ' JOIN [dbo].[Organizations] orgTarget on cr.id_target_organization = orgTarget.id' +
      ' JOIN [dbo].[Connection_Status] cs1 ON cr.id = cs1.id_connection_request'  +
      ' JOIN [dbo].[Connection_Values_Status] cvs on cs1.id_status = cvs.id' +
      ' INNER JOIN ( ' +
      '    SELECT cs.id_connection_request, MAX(cs.edited_date) as maxDate FROM [dbo].[Connection_Status] cs GROUP BY cs.id_connection_request' +
      ' ) subMax ON subMax.id_connection_request = cs1.id_connection_request AND subMax.maxDate = cs1.edited_date ' +
      ' WHERE 1=1 ';

	IF @status IS NOT NULL
	BEGIN
		SELECT @id_status = id FROM [dbo].[Connection_Values_Status] cvs WHERE cvs.status = @status
		SET @Filters = ' AND id_status = @id_status'
	END

	IF @id IS NOT NULL
	  SET @Filters = + @Filters + ' AND cr.id = @id'

	IF @source_organization IS NOT NULL
	  SET @Filters = + @Filters + ' AND id_source_organization = @source_organization'

	SET @SQL = @SQL + @Filters+ ' ORDER BY create_date DESC'
	print @SQL
	EXEC sp_executesql @SQL,
	    N'@source_organization INT, @id_status INT, @id INT',
	    @source_organization=@source_organization, @id_status=@id_status, @id=@id;`;
