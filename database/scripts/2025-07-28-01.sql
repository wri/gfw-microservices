/*========================================================================================
  -- GPV-4654
DB: Organization accounts: Troubleshoot missing account request dates
========================================================================================*/

USE [gfwpro]

ALTER TABLE [dbo].[PendingAccounts]
ADD [organization_active] BIT NOT NULL
CONSTRAINT DF_PendingAccounts_OrganizationActive DEFAULT (1);

-- DEFAULT (1): sets existing rows and future inserts to active (1) by default.