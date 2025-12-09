-- Join API-capable organizations with their users (Athena version)
-- Shows user email and organization name for users in API-capable organizations
-- This query assumes gfwpro_orgs and clientstore_users tables exist in Athena

SELECT 
    U.email AS user_email,
    U.organization_name
FROM gfwpro_orgs AS O
INNER JOIN clientstore_users AS U
    ON O.organization_name = U.organization
WHERE O.is_api_capable = true
ORDER BY U.organization, U.email;
