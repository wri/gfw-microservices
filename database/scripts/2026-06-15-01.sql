-- [GPV-5426]
-- Delete WeeklyAlerts feature flag from DB in all environments

USE [gfwpro];
GO

DELETE FROM [dbo].[FeatureFlags]
WHERE flag_id = 'WeeklyAlerts';