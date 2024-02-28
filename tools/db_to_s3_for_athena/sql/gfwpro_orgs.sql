USE gfwpro;

GO

SELECT Org.id, Org.organization_name, Org.organization_db, Org.organization_status_id, Org.organization_activated_time
	, s.status_name AS org_status
	--, ss.status_name AS org_subscription_status
FROM dbo.Organizations Org
--LEFT JOIN dbo.SubscriptionStatuses ss ON ss.id = Org.subscription_status_id
LEFT JOIN dbo.Statuses s ON s.id = Org.organization_status_id;
