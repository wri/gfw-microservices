-- [GPV-4429] For each org
-- Update location_classification 
UPDATE [Lists]
SET    [location_classification] = 'Property'
WHERE  [location_classification] IS NULL;
GO
