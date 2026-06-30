-- [GPV-5453]
-- Delete definition of DegradedPastureLayer feature flag from DB

USE [gfwpro];
GO

DELETE FROM [dbo].[FeatureFlags]
WHERE flag_id = 'DegradedPastureLayer';