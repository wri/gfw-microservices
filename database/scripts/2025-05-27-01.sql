/*========================================================================================
  -- GPV-4189
DB: Add location_error column to Analyses-Dashboard table
========================================================================================*/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER TABLE [dbo].[Analyses-Dashboard]
ADD [location_error] [nvarchar](max) NULL;
GO