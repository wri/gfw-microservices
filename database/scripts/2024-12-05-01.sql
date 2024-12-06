-- feat [GPV-3854] add "options" column to ListsAnalysisStatus table

ALTER TABLE [dbo].[ListsAnalysisStatus]
ADD [options] NVARCHAR(32) NULL;