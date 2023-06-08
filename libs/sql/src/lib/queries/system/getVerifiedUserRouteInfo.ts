const getVerifiedUserRouteInfo = `SELECT UR.user_email, US.user_secret, UR.organization_id, UR.organization_user_id,
UR.organization_user_status_id, OG.organization_name, OG.organization_db, OG.organization_status_id, OG.subscription_status_id
FROM UserRoutes UR LEFT JOIN UserSecrets US ON UR.user_email = US.user_email
LEFT JOIN Organizations OG ON UR.organization_id = OG.id
WHERE UR.user_email = @userEmail AND UR.organization_user_status_id <> 3`;

export { getVerifiedUserRouteInfo };
