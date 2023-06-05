USE master

IF EXISTS(SELECT * FROM sys.databases WHERE NAME='logs-gfwpro')
DROP DATABASE [logs-gfwpro]

-- Create log database for gfwpro
CREATE DATABASE [logs-gfwpro]
GO
USE [logs-gfwpro]
/**************************************************************
	RECREATE THE NODE LOGS TABLE.
**************************************************************/
-- Create the SystemLists Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[NodeLogs]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[NodeLogs]

CREATE TABLE [dbo].[NodeLogs]
(
	[Message] NVARCHAR(MAX),
	[LogDate] DATETIME NOT NULL,
	[Level] NVARCHAR(30) NOT NULL
)
GO