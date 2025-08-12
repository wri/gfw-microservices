/*========================================================================================
  -- GPV-4655
Organization Accounts: Bulk change old Pending statuses to Closed
========================================================================================*/

USE [gfwpro]  

-- 1. Check for Pending accounts with request dates before 2025-01-01
SELECT * 
FROM [gfwpro].[dbo].[PendingAccounts]
WHERE organization_requested_time < '2025-01-01'

-- 2. Update Pending accounts to Closed
-- Set organization_active to 0 for accounts with request dates before 2025-01-01
-- This assumes that 'Closed' status is represented by organization_active = 0
UPDATE [gfwpro].[dbo].[PendingAccounts]
SET [organization_active] = 0
WHERE organization_requested_time < '2025-01-01'