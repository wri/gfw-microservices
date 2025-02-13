-- [GPV-4098]
-- Tool: SQL Multi Script

ALTER TABLE [dbo].[GHGAnalyses]
ADD 
  [ef_co2_by_year] NVARCHAR(MAX),
  [ef_ch4_by_year] NVARCHAR(MAX),
  [ef_n2o_by_year] NVARCHAR(MAX);
GO