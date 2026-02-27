-- GPV-5286: Lower MaxAreaPerList from 1B to 900M HA
-- Canada (~983M HA) and USA (~947M HA) exceed the dissolved geometry Lambda's
-- 15-minute timeout. Lowering the limit ensures users get a meaningful error
-- instead of a silent failure.
-- To be applied to gfwpro database

UPDATE [dbo].[AnalysisLimits]
SET MaxAreaPerList = 900000000
WHERE MaxAreaPerList = 1000000000;
