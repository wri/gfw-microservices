-- Export Organizations with status and subscription status (account type)
USE gfwpro;

GO

SELECT 
    Org.id AS organization_id,
    Org.organization_name,
    Org.organization_db,
    Org.organization_status_id,
    Org.organization_activated_time,
    Statuses.status_name AS org_status,
    SubStatuses.status_name AS account_type
FROM gfwpro.dbo.Organizations AS Org
LEFT JOIN gfwpro.dbo.Statuses AS Statuses 
    ON Org.organization_status_id = Statuses.id
LEFT JOIN gfwpro.dbo.SubscriptionStatuses AS SubStatuses 
    ON Org.subscription_status_id = SubStatuses.id
WHERE Org.organization_name NOT IN (
    'Blue Raster',
    'World Resources Institute',
    'WRI Engagement'
)
ORDER BY Org.organization_name;
