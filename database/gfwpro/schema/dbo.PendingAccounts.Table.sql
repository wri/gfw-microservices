/*    ==Scripting Parameters==

    Source Server Version : SQL Server 2017 (14.0.3401)
    Source Database Engine Edition : Microsoft SQL Server Standard Edition
    Source Database Engine Type : Standalone SQL Server

    Target Server Version : SQL Server 2017
    Target Database Engine Edition : Microsoft SQL Server Standard Edition
    Target Database Engine Type : Standalone SQL Server
*/
USE [gfwpro]
GO
/****** Object:  Table [dbo].[PendingAccounts]    Script Date: 4/4/2023 7:47:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PendingAccounts](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[organization_name] [nvarchar](200) NOT NULL,
	[organization_address] [nvarchar](200) NOT NULL,
	[organization_country] [nvarchar](100) NULL,
	[organization_website] [nvarchar](200) NOT NULL,
	[organization_is_subsidiary] [bit] NOT NULL,
	[organization_parent] [nvarchar](200) NOT NULL,
	[organization_requested_time] [smalldatetime] NULL,
 CONSTRAINT [PK_AccountProfile] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
