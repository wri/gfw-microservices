-- GPV-5254: DB: Add token limit column to AnalysisLimits table
-- To be applied to gfwpro database
ALTER TABLE [dbo].[AnalysisLimits]
ADD tokens_per_year FLOAT NULL;