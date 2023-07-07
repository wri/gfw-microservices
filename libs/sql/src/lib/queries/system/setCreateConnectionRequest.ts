/**
 * This SP is used to create a new connection request.
 * The command requires the following parameters:
 * @source_email AS NVARCHAR(250),
 * @target_email AS NVARCHAR(250),
 * @source_organization INT,
 * @target_organization INT,
 * @status AS NVARCHAR(50) = 'pending'
 */

export const setCreateConnectionRequest = `
    DECLARE @id INT
    DECLARE @id_status INT
    DECLARE @ACCESS_LEVEL_SOURCE INT
    DECLARE @ACCESS_LEVEL_TARGET INT
    DECLARE @now DATETIME
        SET @id = -1
        SET @now = getdate()

        SELECT @id_status = id FROM [dbo].[Connection_Values_Status] tcs WHERE tcs.status = @status
        EXEC uspGetAccessLevelUserAndOrganization @email=@source_email, @organization_id=@source_organization, @access_level=@ACCESS_LEVEL_SOURCE OUTPUT;
        EXEC uspGetAccessLevelUserAndOrganization @email=@target_email, @organization_id=@target_organization, @access_level=@ACCESS_LEVEL_TARGET OUTPUT;

        IF @id_status IS NULL
        BEGIN
          THROW 500400, 'The status not exists and cannot be assigned.', 16;
        END

        IF @ACCESS_LEVEL_SOURCE != 1 OR @ACCESS_LEVEL_SOURCE IS NULL
        BEGIN
          THROW 500400, 'The source user in the requestuser is not administrator.', 16;
        END

        IF @ACCESS_LEVEL_TARGET != 1 OR @ACCESS_LEVEL_TARGET IS NULL
        BEGIN
          THROW 500400, 'The target user in the request is not administrator.', 16;
        END

        IF @source_organization = @target_organization
        BEGIN
          THROW 500400, 'Source and target organization cannot be the same.', 16;
        END

        BEGIN TRY
            insert into Connection_Request (id_source_organization, id_target_organization, create_date, source_email,initial_target_email)
            values (@source_organization, @target_organization, @now, @source_email, @target_email);
            SET @id = @@identity
            insert into Connection_Status (id_status, id_connection_request, editor_email, edited_date)
            values (@id_status, @id, @source_email, @now);
        END TRY
        BEGIN CATCH
            THROW 500400, 'An error has occured when inserting data to database, check if there is no duplicated keys or values are incorrect.', 16;
        END CATCH

        SELECT @id as "id";`;
