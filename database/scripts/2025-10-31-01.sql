-- GPV-5080: Rename integrated alerts area columns to include 'all' prefix
  -- to be applied to all [dbo].[clientstores-xxxx]
  -- to be applied to [dbo].[gfwpro]

-- this query renames columns in [Analyses-Dashboard] table

-- Rename intdist_alerts_area_nominal to intdist_alerts_area_all_nominal
EXEC sp_rename 'dbo.Analyses-Dashboard.intdist_alerts_area_nominal', 'intdist_alerts_area_all_nominal', 'COLUMN';
GO

-- Rename intdist_alerts_area_high to intdist_alerts_area_all_high
EXEC sp_rename 'dbo.Analyses-Dashboard.intdist_alerts_area_high', 'intdist_alerts_area_all_high', 'COLUMN';
GO

-- Rename intdist_alerts_area_highest to intdist_alerts_area_all_highest
EXEC sp_rename 'dbo.Analyses-Dashboard.intdist_alerts_area_highest', 'intdist_alerts_area_all_highest', 'COLUMN';
GO