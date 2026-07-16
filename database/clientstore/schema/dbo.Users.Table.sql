/*    ==Scripting Parameters==

    Source Server Version : SQL Server 2017 (14.0.3401)
    Source Database Engine Edition : Microsoft SQL Server Standard Edition
    Source Database Engine Type : Standalone SQL Server

    Target Server Version : SQL Server 2017
    Target Database Engine Edition : Microsoft SQL Server Standard Edition
    Target Database Engine Type : Standalone SQL Server
*/
USE [clientstore-BlueRaster]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 4/4/2023 7:40:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[first_name] [nvarchar](35) NOT NULL,
	[middle_initial] [nvarchar](2) NOT NULL,
	[last_name] [nvarchar](35) NOT NULL,
	[email] [nvarchar](50) NOT NULL,
	[phone] [varchar](50) NOT NULL,
	[title_id] [int] NOT NULL,
	[other_title] [nvarchar](150) NULL,
	[access_level_id] [int] NOT NULL,
	[status_id] [int] NOT NULL,
	[activated_time] [smalldatetime] NULL,
	[email_subscription] [bit] NOT NULL,
	[is_system_user] [bit] NOT NULL,
	[initial_login] [smalldatetime] NULL,
	[viirs_email_frequency] [int] NULL,
	[glad_email_frequency] [int] NULL,
	[forma_email_frequency] [int] NULL,
	[terrai_email_frequency] [int] NULL,
	[gran_chaco_email_frequency] [int] NULL,
	[deactivation_date] [smalldatetime] NULL,
	[country] [nvarchar](100) NULL,
	[language] [nchar](2) NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [UQ_UserEmail] UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
