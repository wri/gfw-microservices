-- GPV-5142: Update existing ALERTS records to set options to 'Weekly'
-- Target: all existing clientstores

UPDATE [dbo].[ListsAnalysisStatus]
SET [options] = 'Weekly'
WHERE [AnalysisID] = 'ALERTS';