USE gfwpro;
GO

SELECT 
	A.id AS activity_type_id,
	A.activity_type_name,
	ATC.activity_type_category_name
FROM dbo.ActivityType AS A
LEFT JOIN dbo.ActivityTypeCategory AS ATC
	ON ATC.id = A.activity_type_category_id;