-- Export Organizations with status and subscription (account type)
USE gfwpro;

GO

SELECT
    Orgs.id AS organization_id,
    Orgs.organization_name,
    SubStatuses.name AS account_type
FROM gfwpro.dbo.Organizations AS Orgs
LEFT JOIN gfwpro.dbo.SubscriptionStatuses AS SubStatuses
    ON Orgs.subscription_status_id = SubStatuses.id
    -- ignore any internal organizations
WHERE Orgs.organization_name NOT IN (
    'Blue Raster',
    'World Resources Institute',
    'WRI Engagement'
)
ORDER BY Orgs.organization_name;
