/**
 * @param userID INT
 * @param activityTypeID INT
 * @param activityDescription NVARCHAR(MAX)
 * @param activityTime SMALLDATETIME
 */
export const setActivityLog = `INSERT INTO ActivityLog([user_id], activity_type_id, activity_description, activity_time)
VALUES(@userID, @activityTypeID, @activityDescription, @activityTime)`;
