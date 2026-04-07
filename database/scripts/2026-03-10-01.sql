-- Update AnalysisLimits where OrgID is NULL to have update_time starting in year 2000
-- so that global limits appear to have been in effect forever.

UPDATE [dbo].[AnalysisLimits]
SET [update_time] = DATEADD(YEAR, 2000 - YEAR([update_time]), [update_time])
WHERE [OrgID] IS NULL;
