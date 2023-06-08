const getUsersAuthenticationPreferences = `SELECT US.user_email, user_auth_preference_id AS auth_preference_id
FROM UserRoutes AS UR
JOIN UserSecrets AS US on US.user_email = UR.user_email
WHERE UR.organization_id = @organization_id`;

export { getUsersAuthenticationPreferences };
