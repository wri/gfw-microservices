export const getInitialUserRouteInfo = `SELECT UR.user_email, US.user_secret, US.user_auth_preference_id
FROM UserRoutes UR LEFT JOIN UserSecrets US ON UR.user_email = US.user_email
WHERE UR.user_email = @userEmail AND UR.organization_user_status_id <> 3`;
