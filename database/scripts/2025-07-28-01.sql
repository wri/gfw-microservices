/*========================================================================================
  -- GPV-4654
DB: Organization accounts: Troubleshoot missing account request dates
========================================================================================*/

-- Before running the ALTER COLUMN ... NOT NULL part, we must first fix existing NULL values in the table.
-- Run this first: 2025-07-25-01.sql

USE [gfwpro]

ALTER TABLE [dbo].[PendingAccounts]
ADD [organization_active] BIT NOT NULL
CONSTRAINT DF_PendingAccounts_OrganizationActive DEFAULT (1);

-- DEFAULT (1): sets existing rows and future inserts to active (1) by default.