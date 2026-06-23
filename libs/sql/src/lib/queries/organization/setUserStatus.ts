/**
 * @userID INT
 * @statusID INT
 * @activatedTime SMALLDATETIME
 */
export const setUserStatus = `
UPDATE Users SET status_id = @statusID, activated_time = @activatedTime, deactivation_date = @deactivationDate
WHERE id = @userID
`;
