/*========================================================================================
  -- GPV-4654
DB: Organization accounts: Troubleshoot missing account request dates
========================================================================================*/

USE [gfwpro]

-- We must first fix existing NULL values in the table before running the ALTER COLUMN ... NOT NULL part.
-- Run this first:

SELECT COUNT(*) 
FROM dbo.PendingAccounts 
WHERE organization_requested_time IS NULL;

-- If it's not 0, we'll get an error when trying to make the column NOT NULL.

-- Update records with NULL request date:
-- Set a placeholder date and mark them as inactive
UPDATE dbo.PendingAccounts
SET 
    organization_requested_time = '2000-01-01', -- Placeholder date for records without a request date.
    organization_active = 0
WHERE organization_requested_time IS NULL;

-- Now we can safely alter the column to NOT NULL.
ALTER TABLE dbo.PendingAccounts
ADD CONSTRAINT DF_PendingAccounts_RequestedTime
DEFAULT GETDATE() FOR organization_requested_time;

ALTER TABLE dbo.PendingAccounts
ALTER COLUMN organization_requested_time SMALLDATETIME NOT NULL;