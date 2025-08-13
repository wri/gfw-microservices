/*========================================================================================
  -- GPV-4841
Converters Page & Converter Details Page Improvements
========================================================================================*/

USE [gfwpro]

ALTER TABLE [dbo].[ConverterStatus]
ADD 
    [run_type] NVARCHAR(32) NULL,          -- 'GLOBAL', 'TARGETED', 'CONTINUE'
    [dry_run] BIT NULL,                    -- true if this was a dry run
    [finish_time] DATETIME NULL,           -- when the job completed
    [total_lists_affected] INT NULL;       -- optional: count of lists processed (success or error)

