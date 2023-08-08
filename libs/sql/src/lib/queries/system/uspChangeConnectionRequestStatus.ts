export const uspChangeConnectionRequestStatus = `
DECLARE @ID_STATUS INT
DECLARE @NOW DATETIME
DECLARE @ACCESS_LEVEL INT
DECLARE @ORGANIZATION_ID INT
DECLARE @CURRENT_STATUS INT
DECLARE @ID INT
    SELECT @ID_STATUS = cvs.id FROM [dbo].[Connection_Values_Status] cvs WHERE cvs.status = @status;

    SET @NOW = getdate();
    SET @ID = -1;

    IF @ID_STATUS IS NULL
    BEGIN
    	THROW 500400, 'the informed status do not exist', 16;
    END

    IF @ID_STATUS = 4
      SELECT @ORGANIZATION_ID = cr.id_source_organization FROM Connection_Request cr WHERE cr.id = @id_connection_request
    ELSE
      SELECT @ORGANIZATION_ID = cr.id_target_organization FROM Connection_Request cr WHERE cr.id = @id_connection_request

    EXEC uspGetAccessLevelUserAndOrganization @email=@edit_email, @organization_id=@ORGANIZATION_ID, @access_level=@ACCESS_LEVEL OUTPUT;

    IF @ACCESS_LEVEL != 1 OR @ACCESS_LEVEL IS NULL
    BEGIN
    	THROW 500400, 'user is not administrator or not exist inside this organization.', 16;
    END

    SELECT @CURRENT_STATUS = cs.id_status FROM (
        SELECT cs.id_connection_request, MAX(cs.edited_date) as maxDate FROM [dbo].[Connection_Status] cs
        WHERE cs.id_connection_request = @id_connection_request  GROUP BY cs.id_connection_request
    ) as subMax
    JOIN Connection_Status cs ON cs.id_connection_request = subMax.id_connection_request AND cs.edited_date = subMax.maxDate

    IF @ID_STATUS = @CURRENT_STATUS
    BEGIN
    	THROW 500400, 'current status is equal to the one passed.', 16;
    END

    BEGIN TRY
        INSERT INTO  [dbo].[Connection_Status] (id_status, id_connection_request, editor_email, edited_date)
        VALUES (@id_status, @id_connection_request, @edit_email, @now);
        SET @ID = @@identity
    END TRY
    BEGIN CATCH
        THROW 500400, 'Could not change the connection status', 16;
    END CATCH
    SELECT @ID as "id";
`;

export class ConnectionRequestStatus {
  id: number;
}
