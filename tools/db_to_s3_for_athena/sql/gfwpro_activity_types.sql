USE gfwpro;

GO

SELECT AT.id, AT.activity_type_name
	, ATC.activity_type_category_name
FROM dbo.ActivityType AT
LEFT JOIN dbo.ActivityTypeCategory ATC ON ATC.id = AT.activity_type_category_id;
