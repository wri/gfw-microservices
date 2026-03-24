-- Add marketing_email_opt_out column to Users table
-- This column indicates whether the user has opted out of marketing emails (1 = opted out, 0 = opted in).

IF NOT EXISTS (
  SELECT 1
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'Users'
    AND COLUMN_NAME = 'marketing_email_opt_out'
)
BEGIN
  ALTER TABLE [dbo].[Users]
  ADD [marketing_email_opt_out] BIT NOT NULL DEFAULT 0;
END
