/*========================================================================================
  -- GPV-4936
Update GHGAnalyses table to have new columns
========================================================================================*/

-- Drop old columns first 
ALTER TABLE [dbo].[GHGAnalyses]
DROP COLUMN 
    [emissions_factor_by_year],
    [ef_co2_by_year],
    [ef_ch4_by_year],
    [ef_n2o_by_year];
GO

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