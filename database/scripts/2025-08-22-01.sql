/*========================================================================================
  -- GPV-4936
Update GHGAnalyses table to have new columns
========================================================================================*/

-- Add new columns
ALTER TABLE [dbo].[GHGAnalyses]
ADD 
    [emissions_co2_yearly] NVARCHAR(MAX) NULL,
    [emissions_ch4_yearly] NVARCHAR(MAX) NULL,
    [emissions_n2o_yearly] NVARCHAR(MAX) NULL,
    [emissions_yearly] NVARCHAR(MAX) NULL,
    [production] FLOAT NULL,
    [weighted_avg_yield] FLOAT NULL;
GO