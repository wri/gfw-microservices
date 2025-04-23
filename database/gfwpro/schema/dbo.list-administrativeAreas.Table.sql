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
/****** Object:  Table [dbo].[list-administrativeAreas36]    Script Date: 4/4/2023 7:47:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[list-administrativeAreas36](
	[Location Name] [nvarchar](150) NULL,
	[Country] [nvarchar](150) NULL,
	[State] [nvarchar](150) NULL,
	[Sub State] [nvarchar](150) NULL,
	[gadmid] [nvarchar](50) NULL,
	[Latitude] [float] NULL,
	[Longitude] [float] NULL,
	[Location Classification] [nvarchar](150) NULL,
	[Size] [decimal](18, 6) NULL,
	[Geometry] [geometry] NULL,
	[location_id] [int] NULL,
	[id] [int] NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
