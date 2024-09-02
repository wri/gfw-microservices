-- adding AFIAnalysis table to gfwpro
-- across environments DEV, QA, STAGING
CREATE TABLE [dbo].[AFIAnalysis]
(
[list_id] [smallint] NULL,
[location_id] [int] NULL,
[gadm_id] [nvarchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[natural_land_area] [float] NULL,
[natural_land_deforested_area] [float] NULL,
[total_area_ha] [float] NULL,
[status_code] [smallint] NULL,
[location_error] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
[negligible_risk] [float] NULL,
[jrc_land_area] [float] NULL CONSTRAINT [DF_AFIAnalysis_jrc_land_area] DEFAULT ((0)),
[jrc_land_deforested_area] [float] NULL CONSTRAINT [DF__AFIAnalys__jrc_l__0775A75A] DEFAULT ((0)),
[jrc_forest_loss_by_year] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL CONSTRAINT [DF__AFIAnalys__jrc_f__0869CB93] DEFAULT ('{}'),
[natural_forest_loss_by_year] [nvarchar] (max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL CONSTRAINT [DF__AFIAnalys__natur__095DEFCC] DEFAULT ('{}'),
[protected_areas_area] [decimal] (18, 6) NULL,
[landmark_area] [decimal] (18, 6) NULL
) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_AFIAnalysis_gadm_id] ON [dbo].[AFIAnalysis] ([gadm_id]) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_AFIAnalysis_list_id] ON [dbo].[AFIAnalysis] ([list_id]) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_AFIAnalysis_location_id] ON [dbo].[AFIAnalysis] ([location_id]) ON [PRIMARY]
GO