const setActivityLog = `INSERT INTO ActivityLog([user_id], activity_type_id, activity_description, activity_time)
VALUES(@userID, @activityTypeID, @activityDescription, @activityTime)`;

export { setActivityLog };
