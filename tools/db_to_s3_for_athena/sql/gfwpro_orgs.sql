-- Export Organizations with status, subscription status, and API capability
USE gfwpro;
GO

SELECT 
    O.id AS organization_id,
    O.organization_name,
    O.organization_db,
    O.organization_status_id,
    O.organization_activated_time,
    S.status_name AS org_status,
    SubS.status_name AS account_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM ExternalAPIKeys AS K
            WHERE K.organizationId = O.id
        ) THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
    END AS is_api_capable
FROM Organizations AS O
LEFT JOIN Statuses AS S 
    ON O.organization_status_id = S.id
LEFT JOIN SubscriptionStatuses AS SubS
    ON O.subscription_status_id = SubS.id
WHERE O.organization_name NOT IN (
    'Blue Raster',
    'World Resources Institute',
    'WRI Engagement',
    'WRI Consultant',
    'Pro Product Team',
    'GFW Pro LATAM Engagement'
)
ORDER BY O.organization_name;