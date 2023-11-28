export const getGFWProRootUserInfo = `SELECT GUR.id, GUR.user_email, US.user_secret, US.user_auth_preference_id
FROM [GFWProRootUserRoutes] GUR LEFT JOIN UserSecrets US ON GUR.user_email = US.user_email
WHERE GUR.user_email = @userEmail  AND GUR.user_status_id <> 3`;
