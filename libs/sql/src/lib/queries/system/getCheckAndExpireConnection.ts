/**
 * This query is used to check all connection requests
 * that have been pending for 7 days, so their status
 * will be past expired.
 */
export const getCheckAndExpireConnection = `
DECLARE @id_status INT

-- get the id of expired status
SELECT @id_status = cvs.id FROM [dbo].[Connection_Values_Status] cvs WHERE cvs.status = 'expired'

-- set status of expired connection request
INSERT INTO [dbo].[Connection_Status] (id_status, id_connection_request, editor_email, edited_date)
SELECT @id_status as id_status,cr.id as id_connection_request, 'gfw-pro' as editor_email, getdate() as edited_date FROM [dbo].[Connection_Status] cs1
INNER JOIN (
    SELECT cs.id_connection_request, MAX(cs.edited_date) as maxDate FROM [dbo].[Connection_Status] cs GROUP BY cs.id_connection_request
) subMax ON subMax.id_connection_request = cs1.id_connection_request AND subMax.maxDate = cs1.edited_date
JOIN [dbo].[Connection_Request] cr on cs1.id_connection_request = cr.id
JOIN [dbo].[Connection_Values_Status] cvs on cs1.id_status = cvs.id
WHERE cvs.status = 'pending' AND cr.create_date < dateadd(day,-7,getdate())

SELECT @id_status;
`;

export interface CheckAndExpireConnections {
  id_status: number;
}
