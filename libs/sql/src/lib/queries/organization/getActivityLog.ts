export const getActivityLog = `SELECT TOP (10000) U.email, AL.activity_description, AL.activity_time, AL.activity_type_id
FROM ActivityLog AL
LEFT JOIN Users U ON AL.user_id = U.id
ORDER BY AL.activity_time DESC`;
