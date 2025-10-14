-- GPV-5041: 
  -- to be applied to all [dbo].[clientstores-xxxx]
  -- to be applied to [dbo].[gfwpro]

-- this query adds new columns to [Analyses-Dashboard] table
ALTER TABLE [dbo].[Analyses-Dashboard]
ADD 
  [intdist_alerts_area_sbtn_natural_forests_nominal] [nvarchar](max) NULL,
  [intdist_alerts_area_sbtn_natural_forests_high] [nvarchar](max) NULL,
  [intdist_alerts_area_sbtn_natural_forests_highest] [nvarchar](max) NULL,
  [intdist_alerts_area_sbtn_natural_ecosystem_nominal] [nvarchar](max) NULL,
  [intdist_alerts_area_sbtn_natural_ecosystem_high] [nvarchar](max) NULL,
  [intdist_alerts_area_sbtn_natural_ecosystem_highest] [nvarchar](max) NULL,
  [intdist_alerts_area_jrc_nominal] [nvarchar](max) NULL,
  [intdist_alerts_area_jrc_high] [nvarchar](max) NULL,
  [intdist_alerts_area_jrc_highest] [nvarchar](max) NULL,
  [intdist_alerts_area_nominal] [nvarchar](max) NULL,
  [intdist_alerts_area_high] [nvarchar](max) NULL,
  [intdist_alerts_area_highest] [nvarchar](max) NULL;
GO

-- Add default constraints for each column
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_sbtn_natural_forests_nominal] DEFAULT ('{}') FOR [intdist_alerts_area_sbtn_natural_forests_nominal];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_sbtn_natural_forests_high] DEFAULT ('{}') FOR [intdist_alerts_area_sbtn_natural_forests_high];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_sbtn_natural_forests_highest] DEFAULT ('{}') FOR [intdist_alerts_area_sbtn_natural_forests_highest];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_sbtn_natural_ecosystem_nominal] DEFAULT ('{}') FOR [intdist_alerts_area_sbtn_natural_ecosystem_nominal];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_sbtn_natural_ecosystem_high] DEFAULT ('{}') FOR [intdist_alerts_area_sbtn_natural_ecosystem_high];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_sbtn_natural_ecosystem_highest] DEFAULT ('{}') FOR [intdist_alerts_area_sbtn_natural_ecosystem_highest];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_jrc_nominal] DEFAULT ('{}') FOR [intdist_alerts_area_jrc_nominal];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_jrc_high] DEFAULT ('{}') FOR [intdist_alerts_area_jrc_high];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_jrc_highest] DEFAULT ('{}') FOR [intdist_alerts_area_jrc_highest];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_nominal] DEFAULT ('{}') FOR [intdist_alerts_area_nominal];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_high] DEFAULT ('{}') FOR [intdist_alerts_area_high];
GO
ALTER TABLE [dbo].[Analyses-Dashboard] ADD CONSTRAINT [DF_intdist_alerts_area_highest] DEFAULT ('{}') FOR [intdist_alerts_area_highest];
GO