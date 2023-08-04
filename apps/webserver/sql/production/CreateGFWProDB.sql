/*
	@script:
		CreateGFWProDB.sql
	@desc:
		This script helps create the GFWPro databases for the platform and
		populates the database with all the tables and corresponding data
		needed for the site.
	 @owner:
		Blue Raster
	 @history:
		05/21/2017: Creating script.
*/

/*
	RECREATE DATABASE.
*/
--Drop gfwpro if it already exists.
USE master

IF EXISTS(select * from sys.databases where name='gfwpro')
DROP DATABASE gfwpro

--Create Database.
CREATE DATABASE gfwpro
GO
USE gfwpro

/**************************************************************
	RECREATE THE SYSTEMLISTS TABLE.
**************************************************************/
-- Create the SystemLists Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[SystemLists]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[SystemLists]

CREATE TABLE [dbo].[SystemLists]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[list_name] NVARCHAR(150) NOT NULL,
	[list_table_name] NVARCHAR(150) NOT NULL,
	[template_version_id] INT NOT NULL
)
GO
/**************************************************************
	RECREATE THE CLASSIFICATIONS TABLE.
**************************************************************/
-- Create the Classifications Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[Classifications]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[Classifications]

CREATE TABLE [dbo].[Classifications]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[classification_name] VARCHAR(50) NOT NULL,
	CONSTRAINT [PK_Classifications] PRIMARY KEY CLUSTERED(id)
 )
 GO

-- Add Data to the Classifications Tables.
INSERT INTO [dbo].[Classifications] VALUES('Commercial Bank')
INSERT INTO [dbo].[Classifications] VALUES('Consumer Goods Manufacturer')
INSERT INTO [dbo].[Classifications] VALUES('Development Finance Institution')
INSERT INTO [dbo].[Classifications] VALUES('Governmental Organization')
INSERT INTO [dbo].[Classifications] VALUES('Investment Fund')
INSERT INTO [dbo].[Classifications] VALUES('NGO')
INSERT INTO [dbo].[Classifications] VALUES('Producer')
INSERT INTO [dbo].[Classifications] VALUES('Retailer')
INSERT INTO [dbo].[Classifications] VALUES('Processor/Trader')
INSERT INTO [dbo].[Classifications] VALUES('Service Provider')


/**************************************************************
	RECREATE THE GEOGRAPHIES TABLE.
**************************************************************/
-- Create the Geographies Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[Geographies]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[Geographies]

CREATE TABLE [dbo].[Geographies]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[geography_name] VARCHAR(30) NOT NULL,
	CONSTRAINT [PK_Geographies] PRIMARY KEY CLUSTERED(id)
 )
GO

-- Add Data to the Geographies Tables.
INSERT INTO [dbo].[Geographies] VALUES('Asia')
INSERT INTO [dbo].[Geographies] VALUES('Africa')
INSERT INTO [dbo].[Geographies] VALUES('North America')
INSERT INTO [dbo].[Geographies] VALUES('South America')
INSERT INTO [dbo].[Geographies] VALUES('Europe')
INSERT INTO [dbo].[Geographies] VALUES('Australia')


/**************************************************************
	RECREATE THE COMMODITIES TABLE.
**************************************************************/
-- Create the Commodities Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[Commodities]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[Commodities]

CREATE TABLE [dbo].[Commodities]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[commmodity_name] VARCHAR(30) NOT NULL,
	CONSTRAINT [PK_Commodities] PRIMARY KEY CLUSTERED(id)
 )
GO
-- Add Data to the Geographies Tables.
INSERT INTO [dbo].[Commodities] VALUES('cattle')
INSERT INTO [dbo].[Commodities] VALUES('cocoa')
INSERT INTO [dbo].[Commodities] VALUES('coffee')
INSERT INTO [dbo].[Commodities] VALUES('palm oil')
INSERT INTO [dbo].[Commodities] VALUES('pulp and paper')
INSERT INTO [dbo].[Commodities] VALUES('rubber')
INSERT INTO [dbo].[Commodities] VALUES('soy')
INSERT INTO [dbo].[Commodities] VALUES('sugar cane')

/**************************************************************
	RECREATE THE TITLES TABLE.
**************************************************************/
-- Create the Titles Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[Titles]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[Titles]

CREATE TABLE [dbo].[Titles]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[title] VARCHAR(50) NOT NULL,
	CONSTRAINT [PK_Titles] PRIMARY KEY CLUSTERED(id)
 )
GO
-- Add Data to the Titles Tables.
INSERT INTO [dbo].[Titles] VALUES('Analyst')
INSERT INTO [dbo].[Titles] VALUES('Chief Risk Officer')
INSERT INTO [dbo].[Titles] VALUES('Risk Officer')
INSERT INTO [dbo].[Titles] VALUES('Regional Sustainability Officer')
INSERT INTO [dbo].[Titles] VALUES('Sustainability Director')
INSERT INTO [dbo].[Titles] VALUES('Procurement')
INSERT INTO [dbo].[Titles] VALUES('Supply Chain Manager')
INSERT INTO [dbo].[Titles] VALUES('Operations')
INSERT INTO [dbo].[Titles] VALUES('Corporate Affairs Officer')
INSERT INTO [dbo].[Titles] VALUES('Other (please specify)')

/**************************************************************
	RECREATE THE ACCESSLEVELS TABLE.
**************************************************************/
-- Create the AccessLevels Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[AccessLevels]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[AccessLevels]

CREATE TABLE [dbo].[AccessLevels]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[accesslevel_name] VARCHAR(30) NOT NULL,
	[accesslevel_description] VARCHAR(200) NOT NULL,
	CONSTRAINT [PK_AccessLevels] PRIMARY KEY CLUSTERED(id)
 )
GO

-- Add Data to the AccessLevels Tables.
INSERT INTO [dbo].[AccessLevels] VALUES('Administrator', 'Allows administration of the account.')
INSERT INTO [dbo].[AccessLevels] VALUES('Editor', 'An editor can add/update/delete new/existing location data')
INSERT INTO [dbo].[AccessLevels] VALUES('Viewer', 'A user allowed to run and view analysis on existing data')

/**************************************************************
	RECREATE THE Statuses TABLE.
**************************************************************/
-- Create the Statuses Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[Statuses]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[Statuses]

CREATE TABLE [dbo].[Statuses]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[status_name] VARCHAR(30) NOT NULL,
	[status_description] VARCHAR(200) NOT NULL,
	CONSTRAINT [PK_Statuses] PRIMARY KEY CLUSTERED(id)
 )
GO

-- Add Data to the Statuses Tables.
INSERT INTO [dbo].[Statuses] VALUES('Pending', 'Entity has been created but not activated.')
INSERT INTO [dbo].[Statuses] VALUES('Active', 'Entity that is active')
INSERT INTO [dbo].[Statuses] VALUES('Inactive', 'Entity that is de-activated')

/**************************************************************
	RECREATE THE ORGANIZATIONS TABLE.
**************************************************************/
-- Create the Organizations Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[Organizations]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[Organizations]

CREATE TABLE [dbo].[Organizations]
(
	[id] INT NOT NULL,
	[organization_name] VARCHAR(200) NOT NULL,
	[organization_db] VARCHAR(200) NOT NULL,
	[organization_status_id] INT NOT NULL,
	[organization_activated_time] SMALLDATETIME NULL,
	CONSTRAINT [PK_Organizations] PRIMARY KEY CLUSTERED(id),
	INDEX [Organizations_01] NONCLUSTERED(id)
 )
GO

/**************************************************************
	RECREATE THE USERROUTES TABLE.
**************************************************************/
-- Create the UserRoutes Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[UserRoutes]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[UserRoutes]

CREATE TABLE [dbo].[UserRoutes]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[user_email] NVARCHAR(50) NOT NULL,
	[organization_id] INT NOT NULL,
	[organization_user_id] INT NOT NULL,
	[organization_user_status_id] INT NOT NULL,
	CONSTRAINT [PK_UserRoutes] PRIMARY KEY CLUSTERED(id),
	INDEX [UserRoutes_01] NONCLUSTERED(user_email)
 )
GO

/**************************************************************
	RECREATE THE USERSECRETS TABLE.
**************************************************************/
-- Create the UserSecrets Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[UserSecrets]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[UserSecrets]

CREATE TABLE [dbo].[UserSecrets]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[user_email] NVARCHAR(50) NOT NULL,
	[user_secret] VARCHAR(64) NOT NULL,
	[user_auth_preference_id] INT NOT NULL
	CONSTRAINT [PK_UserSecrets] PRIMARY KEY CLUSTERED(id),
	INDEX [UserSecrets_01] NONCLUSTERED(user_email)
 )
GO

/**************************************************************
	RECREATE THE GFWProRootUserRoutes TABLE.
**************************************************************/
-- Create the GFWProRootUserRoutes Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[GFWProRootUserRoutes]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[GFWProRootUserRoutes]

CREATE TABLE [dbo].[GFWProRootUserRoutes]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[user_email] NVARCHAR(50) NOT NULL,
	[first_name] NVARCHAR(35) NOT NULL,
	[middle_initial] NVARCHAR(2) NOT NULL,
	[last_name] NVARCHAR(35) NOT NULL,
	[phone] VARCHAR(50) NOT NULL,
	[title_id] INT NOT NULL,
	[other_title] NVARCHAR(150),
	[user_status_id] INT NOT NULL,
	CONSTRAINT [PK_GFWProRootUserRoutes] PRIMARY KEY CLUSTERED(id)
 )
GO

-- Add the GFW Pro Root Users to the table.
DECLARE @rootTitleID INT
SET @rootTitleID = 10 -- Assuming Other is id 10
INSERT INTO [dbo].[GFWProRootUserRoutes](user_email, first_name, middle_initial, last_name, phone, title_id, other_title, user_status_id)
VALUES('jlloyd@wri.org', 'Jane', '', 'Lloyd', '+1 (202) 729-7828', @rootTitleID, '', 2)
INSERT INTO [dbo].[GFWProRootUserRoutes](user_email, first_name, middle_initial, last_name, phone, title_id, other_title, user_status_id)
VALUES('amaddocks@wri.org', 'Andrew', '', 'Maddocks', '+1 (202) 729-7687', @rootTitleID, '', 2)
INSERT INTO [dbo].[GFWProRootUserRoutes](user_email, first_name, middle_initial, last_name, phone, title_id, other_title, user_status_id)
VALUES('elizabeth.cole@wri.org', 'Elizabeth', '', 'Cole', '+1 (202) 729-7975', @rootTitleID, '', 2)


-- Add Secrets for the Pro Root Users.
INSERT INTO [dbo].[UserSecrets](user_email, user_secret, user_auth_preference_id) VALUES('jlloyd@wri.org', 'FRJEUUCGNZ2CSWSYM4STG5SJPVEUUUCCLN3HARJTOA4G2N2GKV5A', 0)
INSERT INTO [dbo].[UserSecrets](user_email, user_secret, user_auth_preference_id) VALUES('amaddocks@wri.org', 'O5WESYL2JRLH2VSBERUHMKCJOI6HOXKSKRTUQOSLLZGFGODLHZ', 0)
INSERT INTO [dbo].[UserSecrets](user_email, user_secret, user_auth_preference_id) VALUES('elizabeth.cole@wri.org', 'IRZWQL2SI5JWI63WGREUGWDMNNNTAYKQFE4WEVT5MJJHS3ZMHM', 0)
GO


/**************************************************************
	RECREATE THE PENDINGACCOUNTS TABLE.
**************************************************************/
-- Create the PendingAccounts Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[PendingAccounts]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[PendingAccounts]

CREATE TABLE [dbo].[PendingAccounts]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[organization_name] NVARCHAR(200) NOT NULL,
	[organization_address] NVARCHAR(200) NOT NULL,
	[organization_website] NVARCHAR(200) NOT NULL,
	[organization_is_subsidiary] BIT NOT NULL,
	[organization_parent] NVARCHAR(200) NOT NULL,
	CONSTRAINT [PK_AccountProfile] PRIMARY KEY CLUSTERED(id)
 )
GO

/**************************************************************
	RECREATE THE PENDINGACCOUNTSCLASSIFICATIONS TABLE.
**************************************************************/
-- Create the PendingAccountsClassifications Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[PendingAccountsClassifications]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[PendingAccountsClassifications]

CREATE TABLE [dbo].[PendingAccountsClassifications]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[pendingaccounts_id] INT NOT NULL,
	[classification_id] INT NOT NULL,
	CONSTRAINT [PK_AccountClassifications] PRIMARY KEY CLUSTERED(id),
	INDEX [PendingAccountsClassifications_01] NONCLUSTERED(pendingaccounts_id)
 )
GO

/**************************************************************
	RECREATE THE PENDINGACOUNTSUSERS TABLE.
**************************************************************/
-- Create the PendingAccountsUsers Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[PendingAccountsUsers]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[PendingAccountsUsers]

CREATE TABLE [dbo].[PendingAccountsUsers]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[pendingaccounts_id] INT NOT NULL,
	[first_name] NVARCHAR(35) NOT NULL,
	[middle_initial] NVARCHAR(2) NOT NULL,
	[last_name] NVARCHAR(35) NOT NULL,
	[email] NVARCHAR(50) NOT NULL,
	[phone] VARCHAR(50) NOT NULL,
	[title_id] INT NOT NULL,
	[other_title] NVARCHAR(150),
	[access_level_id] INT NOT NULL,
	[status_id] INT NOT NULL,
	[email_subscription] BIT NOT NULL,
	CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED(id),
	INDEX [PendingAccountsUsers_01] NONCLUSTERED([pendingaccounts_id])
 )
GO

/**************************************************************
	RECREATE THE PENDINGACCOUNTSUSERSCOMMODITIES TABLE.
**************************************************************/
-- Create the PendingAccountsUsersCommodities Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[PendingAccountsUsersCommodities]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[PendingAccountsUsersCommodities]

CREATE TABLE [dbo].[PendingAccountsUsersCommodities]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[pendingaccountsuser_id] INT NOT NULL,
	[commodity_id] INT NOT NULL
	CONSTRAINT [PK_PendingAccountsUserCommodities] PRIMARY KEY CLUSTERED(id),
	INDEX [PendingAccountsUserCommodities_01] NONCLUSTERED([pendingaccountsuser_id])
 )
GO

/**************************************************************
	RECREATE THE PENDINGACCOUNTSUSERSGEOGRAPHIES TABLE.
**************************************************************/
-- Create the PendingAccountsUsersGeographies Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[PendingAccountsUsersGeographies]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[PendingAccountsUsersGeographies]

CREATE TABLE [dbo].[PendingAccountsUsersGeographies]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[pendingaccountsuser_id] INT NOT NULL,
	[geography_id] INT NOT NULL
	CONSTRAINT [PK_PendingAccountsUsersGeographies] PRIMARY KEY CLUSTERED(id),
	INDEX [PendingAccountsUsers_01] NONCLUSTERED([pendingaccountsuser_id])
 )
GO

/**************************************************************
	RECREATE THE PENDINGACCOUNTSPOLICIES TABLE.
**************************************************************/
-- Create the PendingAccountPolicies Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[PendingAccountPolicies]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[PendingAccountPolicies]

CREATE TABLE [dbo].[PendingAccountsPolicies]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[organization_id] INT NOT NULL,
	[document_name] NVARCHAR(250) NOT NULL
	CONSTRAINT [PK_PendingAccountPolicies] PRIMARY KEY CLUSTERED(id),
	INDEX [PendingAccountPolicies_01] NONCLUSTERED([organization_id])
 )
GO

/**************************************************************
	RECREATE THE ACTIVITY TYPE CATEGORIES TABLE.
**************************************************************/
-- Create the Activity Type Categories Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[ActivityTypeCategory]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[ActivityTypeCategory]

CREATE TABLE [dbo].[ActivityTypeCategory]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[activity_type_category_name] VARCHAR(50) NOT NULL,
	CONSTRAINT [PK_ActivityTypeCategory] PRIMARY KEY CLUSTERED(id)
 )
GO
-- Add Data to the ActivityTypeCategory Tables.
INSERT INTO [dbo].[ActivityTypeCategory] VALUES('Account')
INSERT INTO [dbo].[ActivityTypeCategory] VALUES('User')
INSERT INTO [dbo].[ActivityTypeCategory] VALUES('Location')
INSERT INTO [dbo].[ActivityTypeCategory] VALUES('List')

/**************************************************************
	RECREATE THE ACTIVITY TYPES TABLE.
**************************************************************/
-- Create the Activity Type Categories Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[ActivityType]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[ActivityType]

CREATE TABLE [dbo].[ActivityType]
(
	[id] INT IDENTITY(1,1) NOT NULL,
	[activity_type_category_id] INT NOT NULL,
	[activity_type_name] VARCHAR(50) NOT NULL,
	CONSTRAINT [PK_ActivityType] PRIMARY KEY CLUSTERED(id)
 )
GO

-- Add Data to the ActivityType Tables.
INSERT INTO [dbo].[ActivityType] VALUES(1, 'AccountRequested')
INSERT INTO [dbo].[ActivityType] VALUES(1, 'AccountActivated')
INSERT INTO [dbo].[ActivityType] VALUES(1, 'AccountDeactivated')
INSERT INTO [dbo].[ActivityType] VALUES(1, 'AccountUpdated')
INSERT INTO [dbo].[ActivityType] VALUES(2, 'UserCreated')
INSERT INTO [dbo].[ActivityType] VALUES(2, 'UserUpdated')
INSERT INTO [dbo].[ActivityType] VALUES(2, 'UserLogin')
INSERT INTO [dbo].[ActivityType] VALUES(2, 'UserLogout')
INSERT INTO [dbo].[ActivityType] VALUES(2, 'UserActivated')
INSERT INTO [dbo].[ActivityType] VALUES(2, 'UserForgotPassword')
INSERT INTO [dbo].[ActivityType] VALUES(2, 'UserResetPassword')
INSERT INTO [dbo].[ActivityType] VALUES(2, 'UserDeactivated')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'LocationUploadedToList')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'LocationDeletedFromList')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'LocationCopiedToList')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'LocationUpdatedInList')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'LocationMovedFromList')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'ListCreated')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'ListUpdate')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'ListUpdateNew')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'ListDeleted')
INSERT INTO [dbo].[ActivityType] VALUES(4, 'ListAnalyzing')

/**************************************************************************
        CREATE LocationType TABLE
**************************************************************************/
-- Create the LocationType Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[LocationType]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[LocationType]

CREATE TABLE [dbo].[LocationType]
(
	-- Columns
	[id] INT IDENTITY(1, 1) NOT NULL,
	[location_type_name] NVARCHAR(50) NOT NULL
	-- Set Primary Key
	CONSTRAINT [PK_LocationType] PRIMARY KEY CLUSTERED(id)
)
/**************************************************************************
        CREATE CommodityTypes TABLE
**************************************************************************/
-- Create the CommodityTypes Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[CommodityTypes]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[CommodityTypes]

CREATE TABLE [dbo].[CommodityTypes]
(
	-- Columns
	[id] INT IDENTITY(1, 1) NOT NULL,
	[commodity_type] NVARCHAR(50) NOT NULL,
	-- Set Primary Key
	CONSTRAINT [PK_CommodityTypes] PRIMARY KEY CLUSTERED(id)
)

/**************************************************************************
        CREATE LocationAccuracies TABLE
**************************************************************************/
-- Create the LocationAccuracies Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[LocationAccuracies]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[LocationAccuracies]

CREATE TABLE [dbo].[LocationAccuracies]
(
	-- Columns
	[id] INT IDENTITY(1, 1) NOT NULL,
	[location_accuracy] NVARCHAR(50) NOT NULL,
	-- Set Primary Key
	CONSTRAINT [PK_LocationAccuracies] PRIMARY KEY CLUSTERED(id)
)

/**************************************************************************
        CREATE DataTypes TABLE
**************************************************************************/
-- Create the DataTypes Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[DataTypes]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[DataTypes]

CREATE TABLE [dbo].[DataTypes]
(
	-- Columns
	[id] INT IDENTITY(1, 1) NOT NULL,
	[data_type] NVARCHAR(50) NOT NULL,
	-- Set Primary Key
	CONSTRAINT [PK_DataTypes] PRIMARY KEY CLUSTERED(id)
)

/**************************************************************************
        CREATE UITypes TABLE
**************************************************************************/
-- Create the UITypes Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[UITypes]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[UITypes]

CREATE TABLE [dbo].[UITypes]
(
	-- Columns
	[id] INT IDENTITY(1, 1) NOT NULL,
	[ui_type] NVARCHAR(50) NOT NULL,
	-- Set Primary Key
	CONSTRAINT [PK_UITypes] PRIMARY KEY CLUSTERED(id)
)

/**************************************************************************
        CREATE TemplateDropdowns TABLE
**************************************************************************/
-- Create the TemplateDropdowns Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[TemplateDropdowns]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[TemplateDropdowns]

CREATE TABLE [dbo].[TemplateDropdowns]
(
	-- Columns
	[id] INT IDENTITY(1,1) NOT NULL,
	[template_metadata_id] INT NOT NULL,
	[dropdown_value] NVARCHAR(150) NOT NULL,
	-- Set Primary Key
	CONSTRAINT [PK_TemplateDropdowns] PRIMARY KEY CLUSTERED(id)
)

/**************************************************************************
        CREATE Templates TABLE
**************************************************************************/
-- Create the Templates Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[Templates]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[Templates]

CREATE TABLE [dbo].[Templates]
(
	-- Columns
	[id] INT IDENTITY(1, 1) NOT NULL,
	[location_type_id] INT NOT NULL, -- Refer to LocationType Table
	[template_name] NVARCHAR(50) NOT NULL,
	-- Set Primary Key
	CONSTRAINT [PK_Templates] PRIMARY KEY CLUSTERED(id)
)

/**************************************************************************
        CREATE TemplateMetadata TABLE
**************************************************************************/
-- Create the TemplateMetadata Table.
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = OBJECT_ID(N'[dbo].[TemplateMetadata]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
DROP TABLE [dbo].[TemplateMetadata]

CREATE TABLE [dbo].[TemplateMetadata]
(
	-- Columns
	[id] INT IDENTITY(1 ,1) NOT NULL,
	[template_id] INT NOT NULL, -- Refer to TemplateVersions Table
	[template_datum_field_name] NVARCHAR(100) NOT NULL,
	[template_datum_field_description] NVARCHAR(300) NOT NULL,
	[template_datum_type_id] INT NOT NULL,
	[template_datum_mandatory] BIT NOT NULL,
	[template_datum_system] BIT NOT NULL,
	[template_datum_ui_id] INT NOT NULL,
	-- Set Primary Key
	CONSTRAINT [PK_TemplateMetadata] PRIMARY KEY CLUSTERED(id)
)

/**************************************************************************
        DECLARE VARIABLES
**************************************************************************/
-- Declare UITypes variables
DECLARE @inputType INT
DECLARE @singleDropdownType INT
DECLARE @multiDropdownType INT
-- Declare DataType variables
DECLARE @integerType INT
DECLARE @floatType INT
DECLARE @datetimeType INT
DECLARE @smallDatetimeType INT
DECLARE @textType INT
DECLARE @nvarcharType INT
DECLARE @binaryType INT
DECLARE @variantType INT
DECLARE @bitType INT
DECLARE @bigintType INT
-- Declare LocationType variables
DECLARE @investmentLocationType INT
DECLARE @commodityLocationType INT
-- Declare Templates variables
DECLARE @investment INT
DECLARE @palmOilMill INT
DECLARE @palmOilPlantation INT
DECLARE @palmSmallholderFarm INT
DECLARE @palmOilGeneric INT
DECLARE @soySilo INT
DECLARE @soyFarm INT
DECLARE @soyGeneric INT
DECLARE @beefSlaughterhouse INT
DECLARE @cattleRanch INT
DECLARE @cattleGeneric INT
DECLARE @cocoaFarm INT
DECLARE @cocoaFarmGeneric INT
DECLARE @other INT
-- Declare Variables for dropdown
DECLARE @i_commodity_dd INT
DECLARE @i_ccy_dd INT
DECLARE @i_companyRanking_dd INT
DECLARE @i_riskLevel_dd INT
DECLARE @i_toi_dd INT
DECLARE @i_cert_dd INT
DECLARE @pom_locClass_dd INT
DECLARE @pom_verified_dd INT
DECLARE @pom_oilType_dd INT
DECLARE @pom_rspo_dd INT
DECLARE @pom_cert_dd INT
DECLARE @pop_locClass_dd INT
DECLARE @pop_rspo_dd INT
DECLARE @pop_cert_dd INT
DECLARE @psf_locClass_dd INT
DECLARE @psf_rspo_dd INT
DECLARE @psf_cert_dd INT
DECLARE @pog_locClass_dd INT
DECLARE @pog_oilType_dd INT
DECLARE @pog_rspo_dd INT
DECLARE @pog_cert_dd INT
DECLARE @ss_locClass_dd INT
DECLARE @ss_facilType_dd INT
DECLARE @ss_cert_dd INT
DECLARE @sf_locClass_dd INT
DECLARE @sf_cert_dd INT
DECLARE @sg_locClass_dd INT
DECLARE @sg_cert_dd INT
DECLARE @bs_locClass_dd INT
DECLARE @cr_locClass_dd INT
DECLARE @cg_locClass_dd INT
DECLARE @cg_cert_dd INT
DECLARE @cf_locClass_dd INT
DECLARE @cf_cert_dd INT
DECLARE @cfg_locClass_dd INT
DECLARE @cfg_cert_dd INT
DECLARE @o_commodity_dd INT
DECLARE @o_locClass_dd INT
DECLARE @o_cert_dd INT

/**************************************************************************
        INSERT ROWS
**************************************************************************/
-- Insert Rows to LocationAccuracies Type
INSERT INTO [dbo].[LocationAccuracies] VALUES ('Very Confident')
INSERT INTO [dbo].[LocationAccuracies] VALUES ('Moderately Confident')
INSERT INTO [dbo].[LocationAccuracies] VALUES ('Not Confident')
INSERT INTO [dbo].[LocationAccuracies] VALUES ('Don''t Know')

-- Insert Rows to UITypes Table
INSERT INTO [dbo].[UITypes] VALUES ('input')
	SET @inputType = SCOPE_IDENTITY()
INSERT INTO [dbo].[UITypes] VALUES ('single-dropdown')
	SET @singleDropdownType = SCOPE_IDENTITY()
INSERT INTO [dbo].[UITypes] VALUES ('multi-dropdown')
	SET @multiDropdownType = SCOPE_IDENTITY()

-- Insert Rows to DataTypes Table
INSERT INTO [dbo].[DataTypes] VALUES ('GEOMETRY')
INSERT INTO [dbo].[DataTypes] VALUES ('INT')
	SET @integerType = SCOPE_IDENTITY()
INSERT INTO [dbo].[DataTypes] VALUES ('FLOAT')
	SET @floatType = SCOPE_IDENTITY()
INSERT INTO [dbo].[DataTypes] VALUES ('DATETIME')
	SET @datetimeType = SCOPE_IDENTITY()
INSERT INTO [dbo].[DataTypes] VALUES ('SMALLDATETIME')
	SET @smallDatetimeType = SCOPE_IDENTITY()
INSERT INTO [dbo].[DataTypes] VALUES ('TEXT')
	SET @textType = SCOPE_IDENTITY()
INSERT INTO [dbo].[DataTypes] VALUES ('NVARCHAR(150)')
	SET @nvarcharType = SCOPE_IDENTITY()
INSERT INTO [dbo].[DataTypes] VALUES ('BINARY')
	SET @binaryType = SCOPE_IDENTITY()
INSERT INTO [dbo].[DataTypes] VALUES ('SQL_VARIANT')
	SET @variantType = SCOPE_IDENTITY()
INSERT INTO [dbo].[DataTypes] VALUES ('BIT')
	SET @bitType = SCOPE_IDENTITY()
INSERT INTO [dbo].[DataTypes] VALUES ('BIGINT')
	SET @bigintType = SCOPE_IDENTITY()

-- Insert Rows to LocationType Table
INSERT INTO [dbo].[LocationType] VALUES ('Investment')
	SET @investmentLocationType = SCOPE_IDENTITY()
INSERT INTO [dbo].[LocationType] VALUES ('Commodity')
	SET @commodityLocationType = SCOPE_IDENTITY()

-- Insert Rows to Templates Table
INSERT INTO [dbo].[Templates] VALUES (@investmentLocationType, 'Investment')
	SET @investment = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Palm Oil Mill')
	SET @palmOilMill = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Palm Oil Plantation')
	SET @palmOilPlantation = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Palm Smallholder Farm')
	SET @palmSmallholderFarm = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Palm Oil Generic')
	SET @palmOilGeneric = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Soy Silo')
	SET @soySilo = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Soy Farm')
	SET @soyFarm = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Soy Generic')
	SET @soyGeneric = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Beef Slaughterhouse')
	SET @beefSlaughterhouse = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Cattle Ranch')
	SET @cattleRanch = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Cattle Generic')
	SET @cattleGeneric = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Cocoa Farm')
	SET @cocoaFarm = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES(@commodityLocationType, 'Cocoa Generic')
	SET @cocoaFarmGeneric = SCOPE_IDENTITY()
INSERT INTO [dbo].[Templates] VALUES (@commodityLocationType, 'Other')
	SET @other = SCOPE_IDENTITY()

-- Insert Rows to TemplateMetadata Table
--- Investment
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Investment Name', '', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Latitude', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Longitude', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Commodity', 'Cattle, Cocoa, Coffee, Palm Oil, Pulp and Paper, Soy, Sugar Cane', @nvarcharType, 1, 1, @singleDropdownType)
	SET @i_commodity_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Company Policy Ranking', 'A/B or C', @nvarcharType, 0, 1, @singleDropdownType)
	SET @i_companyRanking_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Risk Level', 'High/Medium or Low', @nvarcharType, 0, 1, @singleDropdownType)
	SET @i_riskLevel_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Counterparty', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Parent Company or Group', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Type of Investment', 'New Investment or Renewal', @nvarcharType, 0, 1, @singleDropdownType)
	SET @i_toi_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Certification', 'NONE, RSPO, ISPO, MSPO, SAN, ISCC, RTRS, ISCC, AAPRESID, UTZ, Fairtrade, Rainforest Alliance, and Other Standard', @nvarcharType, 0, 1, @multiDropdownType)
	SET @i_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Size of Investment', '', @bigintType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'CCY', '', @nvarcharType, 0, 1, @singleDropdownType)
	SET @i_ccy_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@investment, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

--- Palm Oil Mill
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Location Name', 'Mill name', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Latitude', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Longitude', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Commodity', 'Palm Oil', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @pom_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Company ID', 'Unique ID assigned by user''s company to the palm mill', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'ID', 'Unique WRI mill ID', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Volume', 'Volume of palm oil sourced from the mill in megatons if you buy from this mill; Volume of palm oil produced at the mill if you own the mill', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Parent Company', 'Parent Company name or RSPO membership name of the mill. If the mill is present within the GFW Universal Mill List, then it will be matched to this list''s Parent Company name information', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Supplier Name', 'Supplier name (i.e. the name of the supplier this mill is associated with that user sources from - only applicable if user does not own the mill)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Refinery Name', 'Associated refinery name (associated with Supplier)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Second Supplier Name', 'Supplier name (i.e. the name of the direct/tier 1 supplier this mill is associated with that user sources from)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Second Refinery Name', 'Associated refinery name (associated with Supplier 2)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Verified?', 'Say yes if an initial mill verification assessment has been conducted', @nvarcharType, 0, 1, @singleDropdownType)
	SET @pom_verified_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Oil Type', 'Type of oil: Palm Oil, Palm Kernel Oil', @nvarcharType, 0, 1, @singleDropdownType)
	SET @pom_oilType_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'RSPO Model', 'RSPO model: IP, MB, SG, MB/SG, MB/IP', @nvarcharType, 0, 1, @singleDropdownType)
	SET @pom_rspo_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Certification', 'None means this mill is not certified against any standard; RSPO, ISPO, MSPO, SAN, ISCC, and Other Standard means this mill is certified according to the standard listed', @nvarcharType, 0, 1, @multiDropdownType)
	SET @pom_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Direct FFB', 'Percentage of FFB input into the mill from direct estates', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Other FFB', 'Percentage of FFB input into the mill from third party estates', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Associated Smallholder FFB', 'Percentage of FFB input into the mill from associated smallholders', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Independent Smallholder FFB', 'Percentage of FFB input into the mill from independent smallholders', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilMill, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

--- Palm Oil Plantation
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Location Name', 'Palm Oil Plantation Name', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Latitude', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Longitude', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Commodity', 'Palm Oil', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @pop_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Company ID', 'Unique ID assigned by user''s company to the palm plantation or concession', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Volume', 'Volume of palm oil originating from the plantation or concession in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Parent Company', 'Group name or RSPO membership name of the plantation or concession', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Supplier Name', 'Supplier name (i.e. the name of the supplier this plantation or concession is associated with that user sources from - only applicable if user does not own the plantation or concession)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Facility Name', 'Associated mill name', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Refinery Name', 'Associated refinery name (associated with Supplier)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Second Supplier Name', 'Supplier name (i.e. the name of the direct/tier 1 supplier this mill is associated with that user sources from)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Second Refinery Name', 'Associated refinery name (associated with Supplier 2)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'RSPO Model', 'RSPO model: IP, MB, SG, MB/SG, MB/IP', @nvarcharType, 0, 1, @singleDropdownType)
	SET @pop_rspo_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Certification', 'None means this plantation or concession is not certified against any standard; RSPO, ISPO, MSPO, SAN, ISCC, and Other Standard means this plantation or concession is certified according to the standard listed', @nvarcharType, 0, 1, @multiDropdownType)
	SET @pop_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilPlantation, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

--- Palm Smallholder Farm
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Location Name', 'Name of the Palm Oil farm', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Latitude', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Longitude', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Commodity', 'Palm Oil', @nvarcharType, 1, 1, @inputType)
	SET @psf_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Company ID', 'Unique ID assigned by user''s company to the palm farm', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Volume', 'Volume of palm oil originating from the farm in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Supplier Name', 'Supplier name (i.e. the name of the tier 1/direct supplier this farm is associated with that user sources from - only applicable if user does not own the farm)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Facility Name', 'Associated mill name', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Second Supplier Name', 'Supplier name (i.e. the name of the direct/tier 1 supplier this plantation or concession is associated with that user sources from)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'RSPO Model', 'RSPO model: IP, MB, SG, MB/SG, MB/IP', @nvarcharType, 0, 1, @singleDropdownType)
	SET @psf_rspo_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Certification', 'None means this plantation or concession is not certified against any standard; RSPO, ISPO, MSPO, SAN, ISCC, and Other Standard means this plantation or concession is certified according to the standard listed', @nvarcharType, 0, 1, @multiDropdownType)
	SET @psf_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Type of Smallholder', 'Smallholder type (i.e. scheme/associated or independent)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Number of Smallholders', 'Number of smallholders producers associated with this farm', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmSmallholderFarm, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

-- Palm Oil Generic
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Location Name', 'Name of the location, name of the Mill, name of the farm', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Commodity', 'Palm Oil', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @pog_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Company ID', 'Unique ID assigned by user''s company to the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Volume', 'Volume of commodity originating from the point or polygon in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Owner Name', 'Name of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Owner ID', 'Unique ID of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Parent Company', 'Company name associated with the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Supplier Name', 'Supplier name (i.e. the name of the supplier this point or polygon is associated with that user sources from - only applicable if user does not own the mill)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Facility Name', 'Name of the point''s or polygon''s associated processing facility (e.g. mill, crusher, grinder)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Refinery Name', 'Name of the point''s or polygon''s associated refinery (associated with Supplier) ', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Second Supplier Name', 'Supplier name (i.e. the name of the direct/tier 1 supplier  this point or polygon is associated with that user sources from)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Second Refinery Name', 'Associated refinery name (associated with Supplier 2)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Oil Type', 'Type of oil: Palm Oil, Palm Kernel Oil', @nvarcharType, 0, 1, @singleDropdownType)
	SET @pog_oilType_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'RSPO Model', 'RSPO model: IP, MB, SG, MB/SG, MB/IP', @nvarcharType, 0, 1, @singleDropdownType)
	SET @pog_rspo_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Certification', 'Yes means this point or polygon is certified; No means this point or polygon is not certified', @nvarcharType, 0, 1, @singleDropdownType)
	SET @pog_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@palmOilGeneric, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

--- Soy Silo
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Location Name', 'Soy Silo name', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Commodity', 'Soy', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @ss_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'ID', 'Silo ID', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Volume', 'Volume of soy sourced from the soy facility in megatons if you buy from this soy facility; Volume of soy produced at the soy facility if you own the soy facility', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'National Facility Code', 'National facility ID Code used within the country the facility is located within - use CDA for Brazil and ONCAA for Argentina', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Facility Phone', 'Telephone number of the facility', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Facility E-mail', 'E-mail of the facility', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Facility Capacity', 'Capacity of the facility', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Facility Type', 'Type of facility (i.e. silo, crusher, or port)', @nvarcharType, 0, 1, @singleDropdownType)
	SET @ss_facilType_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Facility Owner', 'Name of the owner of the facility', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Business ID', 'Unique business ID for facilities located within Brazil (i.e. CNPJ ID)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Certification', 'None means this facility is not certified against any standard; RTRS, ISCC, AAPRESID, and Other Standard means this facility is certified according to the standard listed', @nvarcharType, 0, 1, @multiDropdownType)
	SET @ss_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soySilo, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

--- Soy Farm
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Location Name', 'Soy farm name', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Commodity', 'Soy', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @sf_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Volume', 'Volume of soy originating from the soy farm in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Company ID', 'Unique farm ID assigned by your company to the farm', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Cadaster ID', 'Cadaster ID for farms located within Brazil (i.e. CAR __)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Owner Name', 'Name of the owner of the farm (also the contact person for the farm)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Owner ID', 'National ID of the farm owner - use CPF for Brazil, RUC for Paraguay, and CUIT for Argentina', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Company Name', 'Company or subsidiary name  of the farm', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Company Contact', 'Name of the company contact person for the farm', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Facility Name', 'Name of the facility (i.e. silo, crusher) associated with the farm', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Facility E-mail', 'E-mail of the facility', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Certification', 'None means this facility is not certified against any standard; RTRS, ISCC, AAPRESID, and Other Standard means this farm is certified according to the standard listed', @nvarcharType, 0, 1, @multiDropdownType)
	SET @sf_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyFarm, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

-- Soy Generic
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Location Name', 'Name of the location, name of the Mill, name of the farm', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Commodity', 'Soy', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Location Classification', '', @nvarcharType, 1, 1, @singleDropdownType)
	SET @sg_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Volume', 'Volume of commodity originating from the point or polygon in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Company ID', 'Unique ID assigned by your company to the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Owner Name', 'Name of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Owner ID', 'Unique ID of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Company Name', 'Company name associated with the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Supplier Name', 'Supplier name (i.e. the name of the supplier this point or polygon is associated with that you source from - only applicable if you do not own the point)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Refinery Name', 'Name of the point''s or polygon''s associated refinery (associated with Supplier)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Facility Name', 'Name of the point''s or polygon''s associated processing facility (e.g. mill, crusher, grinder)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Certification', 'Yes means this point or polygon is certified; No means this point or polygon is not certified', @nvarcharType, 0, 1, @singleDropdownType)
	SET @sg_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@soyGeneric, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

--- Beef Slaughterhouse
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Location Name', 'Beef Slaughterhouse name', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Commodity', 'Cattle', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @bs_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Volume', 'Volume of beef sourced from the slaughterhouse in tons if you buy from this slaughterhouse; Volume of beef produced at the slaughterhouse if you own the slaughterhouse', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Facility Code', 'Unique ID for slaughterhouses located within Brazil (i.e. SIF code)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Slaughterhouse Contact', 'Name of the individual or contact person at the slaughterhouse', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@beefSlaughterhouse, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

--- Cattle Ranch
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Location Name', 'Name of the cattle ranch', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Commodity', 'Cattle', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @cr_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Volume', 'Volume of beef originating from the cattle ranch in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Company ID', 'Unique ID assigned by your company to the ranch', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Cadaster ID', 'Cadaster ID for ranches located within Brazil (i.e. CAR ID)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Owner Name', 'Name of the owner of the ranch', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Owner ID', 'National ID of the ranch owner - use CPF for Brazil, RUC for Paraguay, and CUIT for Argentina', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Company Name', 'Company or subsidiary name of the ranch', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Name of Slaughterhouse', 'Associated or nearest slaughterhouse name', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Code of Slaughterhouse', 'Unique ID for the associated slaughterhouse for slaughterhouses located within Brazil (i.e. SIF code)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleRanch, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

-- Cattle Generic
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Location Name', 'Name of the location, name of the Mill, name of the farm', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Commodity', 'Cattle', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @cg_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Volume', 'Volume of commodity originating from the point or polygon in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Company ID', 'Unique ID assigned by your company to the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Owner Name', 'Name of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Owner ID', 'Unique ID of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Company Name', 'Company name associated with the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Supplier Name', 'Supplier name (i.e. the name of the supplier this point or polygon is associated with that you source from - only applicable if you do not own the point)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Refinery Name', 'Name of the point''s or polygon''s associated refinery (associated with Supplier)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Certification', 'Yes means this point or polygon is certified; No means this point or polygon is not certified', @nvarcharType, 0, 1, @singleDropdownType)
	SET @cg_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Facility Name', 'Name of the point''s or polygon''s associated processing facility (e.g. mill, crusher, grinder)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cattleGeneric, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

--- Cocoa Farm
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Location Name', 'Cocoa Farm Name', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Commodity', 'Cocoa', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @cf_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Company ID', 'Unique ID assigned by your company to the farm', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Volume', 'Volume of cocoa beans originating from the farm in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Owner Name', 'Name of the owner of the farm', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Cooperative Name', 'Name of the cooperative the farm is associated with', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Improvement Program', 'Yes means this farm is part of some kind of improvement program; No means this farm is not part of any improvement program', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Certification', 'None means this farm is not certified against any standard; UTZ, Fairtrade, Rainforest Alliance, and Other Standard means this farm is certified according to the standard listed', @nvarcharType, 0, 1, @multiDropdownType)
	SET @cf_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarm, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

-- Cocoa Farm Generic
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Location Name', 'Name of the location, name of the Mill, name of the farm', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Commodity', 'Cocoa', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @cfg_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Company ID', 'Unique ID assigned by your company to the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Volume', 'Volume of commodity originating from the point or polygon in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Owner Name', 'Name of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Owner ID', 'Unique ID of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Company Name', 'Company name associated with the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Supplier Name', 'Supplier name (i.e. the name of the supplier this point or polygon is associated with that you source from - only applicable if you do not own the point)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Facility Name', 'Name of the point''s or polygon''s associated processing facility (e.g. mill, crusher, grinder)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Refinery Name', 'Name of the point''s or polygon''s associated refinery (associated with Supplier)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Certification', 'Yes means this point or polygon is certified; No means this point or polygon is not certified', @nvarcharType, 0, 1, @singleDropdownType)
	SET @cfg_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@cocoaFarmGeneric, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

--- Other
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Location Name', 'Name of the location, name of the Mill, name of the farm', @nvarcharType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Latitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Longitude', '', @floatType, 1, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Analysis Radius', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Analysis Area', '', @floatType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Commodity', 'cattle, cocoa, coffee, palm oil, rubber, pulp and paper, soy, sugar cane, other', @nvarcharType, 1, 1, @singleDropdownType)
	SET @o_commodity_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Location Classification', 'Select or pre-populate whether location that is being identified is a Property, Supply Shed or Administrative Area', @nvarcharType, 1, 1, @singleDropdownType)
	SET @o_locClass_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Company ID', 'Unique ID assigned by your company to the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Volume', 'Volume of commodity originating from the point or polygon in megatons', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Owner Name', 'Name of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Owner ID', 'Unique ID of the owner of the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Company Name', 'Company name associated with the point or polygon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Supplier Name', 'Supplier name (i.e. the name of the supplier this point or polygon is associated with that you source from - only applicable if you do not own the point)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Facility Name', 'Name of the point''s or polygon''s associated processing facility (e.g. mill, crusher, grinder)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Refinery Name', 'Name of the point''s or polygon''s associated refinery (associated with Supplier)', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Certification', 'Yes means this point or polygon is certified; No means this point or polygon is not certified', @nvarcharType, 0, 1, @singleDropdownType)
	SET @o_cert_dd = SCOPE_IDENTITY()
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Start Date', 'Location timeframe - start date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'End Date', 'Location timeframe - end date', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Time Horizon', 'Location timeframe - time horizon', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Accuracy Rating of Location Entered', 'Very Confident, Moderately Confident, Not Confident, Don''t Know', @integerType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Attribute1', 'Additional Attribute 1 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Attribute2', 'Additional Attribute 2 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Attribute3', 'Additional Attribute 3 Value', @nvarcharType, 0, 0, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Country', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Sub State', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Wind Barrier', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Riparian Buffers', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'Buffer Zones', '', @nvarcharType, 0, 1, @inputType)
INSERT INTO [dbo].[TemplateMetadata] VALUES (@other, 'gadmid', '', @nvarcharType, 0, 1, @inputType)

-- INSERT ROWS INTO TemplateDropdowns Table
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_commodity_dd, 'Soy')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_commodity_dd, 'Palm Oil')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_commodity_dd, 'Cattle')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_commodity_dd, 'Cocoa')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_commodity_dd, 'Rubber')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_commodity_dd, 'Pulp and Paper')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_commodity_dd, 'Coffee')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_commodity_dd, 'Sugar Cane')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_commodity_dd, 'Other')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'AED')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'AFN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ALL')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'AMD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ANG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'AOA')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ARS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'AUD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'AWG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'AZN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BAM')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BBD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BDT')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BGN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BHD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BIF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BMD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BND')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BOB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BOV')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BRL')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BSD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BTN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BWP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BYN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'BZD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CAD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CDF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CHE')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CHF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CHW')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CLF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CLP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CNY')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'COP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'COU')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CRC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CUC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CUP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CVE')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'CZK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'DJF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'DKK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'DOP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'DZD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'EGP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ERN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ETB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'EUR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'FJD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'FKP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'GBP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'GEL')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'GHS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'GIP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'GMD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'GNF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'GTQ')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'GYD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'HKD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'HNL')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'HRK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'HTG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'HUF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'IDR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ILS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'INR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'IQD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'IRR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ISK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'JMD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'JOD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'JPY')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'KES')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'KGS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'KHR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'KMF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'KPW')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'KRW')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'KWD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'KYD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'KZT')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'LAK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'LBP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'LKR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'LRD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'LSL')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'LYD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MAD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MDL')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MGA')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MKD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MMK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MNT')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MOP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MRU')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MUR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MVR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MWK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MXN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MXV')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MYR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'MZN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'NAD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'NGN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'NIO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'NOK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'NPR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'NZD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'OMR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'PAB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'PEN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'PGK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'PHP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'PKR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'PLN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'PYG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'QAR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'RON')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'RSD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'RUB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'RWF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SAR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SBD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SCR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SDG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SEK')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SGD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SHP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SLL')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SOS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SRD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SSP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'STN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SVC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SYP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'SZL')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'THB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'TJS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'TMT')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'TND')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'TOP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'TRY')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'TTD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'TWD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'TZS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'UAH')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'UGX')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'USD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'USN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'UYI')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'UYU')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'UZS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'VEF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'VND')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'VUV')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'WST')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XAF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XAG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XAU')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XBA')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XBB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XBC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XBD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XCD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XDR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XOF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XPD')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XPF')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XPT')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XSU')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XTS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XUA')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'XXX')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'YER')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ZAR')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ZMW')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_ccy_dd, 'ZWL')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_companyRanking_dd, 'A')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_companyRanking_dd, 'B')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_companyRanking_dd, 'C')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_riskLevel_dd, 'High')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_riskLevel_dd, 'Medium')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_riskLevel_dd, 'Low')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_toi_dd, 'New Investment')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_toi_dd, 'Renewal')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'NONE')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'RSPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'ISPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'MSPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'SAN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'ISCC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'RTRS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'AAPRESID')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'UTZ')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'Fairtrade')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'Rainforest Alliance')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@i_cert_dd, 'Other Standard')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_verified_dd, 'Yes')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_verified_dd, 'No')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_oilType_dd, 'Palm Oil')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_oilType_dd, 'Palm Kernel Oil')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_rspo_dd, 'IP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_rspo_dd, 'SG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_rspo_dd, 'MB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_rspo_dd, 'MB/SG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_rspo_dd, 'MB/IP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_cert_dd, 'RSPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_cert_dd, 'ISPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_cert_dd, 'MSPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_cert_dd, 'SAN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_cert_dd, 'ISCC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_cert_dd, 'Other Standard')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pom_cert_dd, 'NONE')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_rspo_dd, 'IP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_rspo_dd, 'SG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_rspo_dd, 'MB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_rspo_dd, 'MB/SG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_rspo_dd, 'MB/IP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_cert_dd, 'RSPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_cert_dd, 'ISPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_cert_dd, 'MSPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_cert_dd, 'SAN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_cert_dd, 'ISCC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_cert_dd, 'Other Standard')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pop_cert_dd, 'NONE')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_rspo_dd, 'IP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_rspo_dd, 'SG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_rspo_dd, 'MB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_rspo_dd, 'MB/SG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_rspo_dd, 'MB/IP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_cert_dd, 'RSPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_cert_dd, 'ISPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_cert_dd, 'MSPO')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_cert_dd, 'SAN')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_cert_dd, 'ISCC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_cert_dd, 'Other Standard')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@psf_cert_dd, 'NONE')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_oilType_dd, 'Palm Oil')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_oilType_dd, 'Palm Kernel Oil')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_rspo_dd, 'IP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_rspo_dd, 'SG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_rspo_dd, 'MB')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_rspo_dd, 'MB/SG')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_rspo_dd, 'MB/IP')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_cert_dd, 'Yes')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@pog_cert_dd, 'No')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_facilType_dd, 'Silo')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_facilType_dd, 'Crusher')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_facilType_dd, 'Port')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_cert_dd, 'RTRS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_cert_dd, 'ISCC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_cert_dd, 'AAPRESID')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_cert_dd, 'Other Standard')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@ss_cert_dd, 'NONE')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sf_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sf_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sf_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sf_cert_dd, 'RTRS')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sf_cert_dd, 'ISCC')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sf_cert_dd, 'AAPRESID')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sf_cert_dd, 'Other Standard')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sf_cert_dd, 'NONE')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sg_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sg_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sg_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sg_cert_dd, 'Yes')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@sg_cert_dd, 'No')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@bs_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@bs_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@bs_locClass_dd, 'Administrative Area')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cr_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cr_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cr_locClass_dd, 'Administrative Area')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cg_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cg_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cg_locClass_dd, 'Administrative Area')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cg_cert_dd, 'Yes')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cg_cert_dd, 'No')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cf_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cf_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cf_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cf_cert_dd, 'UTZ')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cf_cert_dd, 'Fairtrade')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cf_cert_dd, 'Rainforest Alliance')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cf_cert_dd, 'Other Standard')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cf_cert_dd, 'None')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cfg_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cfg_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cfg_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cfg_cert_dd, 'Yes')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@cfg_cert_dd, 'No')

INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_commodity_dd, 'Soy')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_commodity_dd, 'Palm Oil')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_commodity_dd, 'Cattle')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_commodity_dd, 'Cocoa')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_commodity_dd, 'Rubber')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_commodity_dd, 'Pulp and Paper')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_commodity_dd, 'Coffee')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_commodity_dd, 'Sugar Cane')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_commodity_dd, 'Other')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_locClass_dd, 'Property')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_locClass_dd, 'Supply Shed')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_locClass_dd, 'Administrative Area')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_cert_dd, 'Yes')
INSERT INTO [dbo].[TemplateDropdowns] VALUES (@o_cert_dd, 'No')

GO

/**************************************************************
	CREATE ALL THE STORED PROCEDURES.
**************************************************************/
CREATE PROCEDURE dbo.uspGetUsersAuthenticationPreferences
	@organization_id INT
AS
	SELECT US.user_email, user_auth_preference_id AS auth_preference_id
	FROM UserRoutes AS UR
	JOIN UserSecrets AS US on US.user_email = UR.user_email
	WHERE UR.organization_id = @organization_id
GO

CREATE PROCEDURE dbo.uspGetUserAuthenticationPreferences
	@organization_id INT,
	@user_email NVARCHAR(150)
AS
	SELECT US.user_email, user_auth_preference_id AS auth_preference_id
	FROM UserRoutes AS UR
	JOIN UserSecrets AS US on US.user_email = UR.user_email
	WHERE UR.organization_id = @organization_id AND UR.user_email = @user_email
GO

CREATE PROCEDURE dbo.uspGetUserSecret
	@user_email NVARCHAR(150)
AS
	SELECT user_secret
	FROM UserSecrets
	WHERE user_email = @user_email
GO

CREATE PROCEDURE dbo.uspActivateGFWPro
AS
	-- Drop the current Organizations table
	DROP TABLE Organizations
	-- Recreate the table by SELECT * INTO
	SELECT * INTO Organizations FROM SnapshotOrganizations
	-- Drop the Snapshot
	DROP TABLE SnapshotOrganizations
	-- Activate GFWProRootUserRoutes
	UPDATE GFWProRootUserRoutes
	SET user_status_id = 2
GO

CREATE PROCEDURE dbo.uspCreateOrganizationSnapshot
AS
	SELECT * INTO SnapshotOrganizations FROM Organizations
GO

CREATE PROCEDURE dbo.deleteUserSecret
	@user_email NVARCHAR(150)
AS
	DELETE FROM UserSecrets WHERE user_email = @user_email
GO

CREATE PROCEDURE dbo.uspDropUserRoute
	@user_email NVARCHAR(150),
	@organization_id INT,
	@organization_user_id INT
AS
	DELETE FROM UserRoutes
	WHERE user_email = @user_email AND organization_id = @organization_id AND organization_user_id = @organization_user_id
GO

CREATE PROCEDURE dbo.uspDeleteSystemTableRow
	@table_name NVARCHAR(150),
	@primary_key INT,
	@column NVARCHAR(150)
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	SET @TEMPLATE = 'DELETE FROM {TABLE_NAME} WHERE {COLUMN} = {PRIMARY_KEY}'
	SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @table_name)
	SET @SQL = REPLACE(@SQL, '{COLUMN}', @column)
	SET @SQL = REPLACE(@SQL, '{PRIMARY_KEY}', @primary_key)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspDropSystemTable
	@table_name NVARCHAR(150)
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	SET @TEMPLATE = 'DROP TABLE IF EXISTS [{TABLE_NAME}]'
	SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @table_name)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspDropDatabase
  @pendingaccounts_id INT
AS
  DECLARE @SQL NVARCHAR(MAX)
  DECLARE @ORGNAME NVARCHAR(200)
  DECLARE @DBNAME NVARCHAR(200)

  SET @ORGNAME = (SELECT organization_name FROM PendingAccounts WHERE id = @pendingaccounts_id)

	-- Removes spaces
  SET @ORGNAME = REPLACE(@ORGNAME, ' ', '')

  SET @DBNAME = 'clientstore-{ORGANIZATION}'
  SET @DBNAME = REPLACE(@DBNAME, '{ORGANIZATION}', @ORGNAME)

  SET @SQL = 'DROP DATABASE IF EXISTS [{DATABASE}]'
  SET @SQL = REPLACE(@SQL, '{DATABASE}', @DBNAME)

  EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspRemovePendingOrganization
  @pendingaccount_id INT
AS
  DECLARE @pendingAccountManagerID INT
  SET @pendingAccountManagerID = (
    SELECT id
    FROM PendingAccountsUsers
    WHERE pendingaccounts_id = @pendingaccount_id
  )

  /********************************************************
  * REMOVE DATA FROM PENDING ACCOUNTS
  ********************************************************/
  -- Remove Data from Pending Account Table.
  DELETE FROM PendingAccounts WHERE id = @pendingaccount_id
  -- Remove Data from Pending Accounts Classification Table.
  DELETE FROM PendingAccountsClassifications WHERE pendingaccounts_id = @pendingaccount_id
  --Remove Data from Pending Accounts Uers Table.
  DELETE FROM PendingAccountsUsers WHERE id = @pendingAccountManagerID
  --Remove Data from Pending Accounts Uers Commodities Table.
  DELETE FROM PendingAccountsUsersCommodities WHERE pendingaccountsuser_id = @pendingAccountManagerID
  --Remove Data from Pending Accounts Uers Geographies Table.
  DELETE FROM PendingAccountsUsersGeographies WHERE pendingaccountsuser_id = @pendingAccountManagerID
  -- Remove Data from Pending Accounts Policies Table.
  DELETE FROM PendingAccountsPolicies WHERE organization_id = @pendingaccount_id
GO

CREATE PROCEDURE dbo.uspGetClassifications
AS
	SELECT * from Classifications ORDER BY classification_name
GO

CREATE PROCEDURE dbo.uspGetCommodities
AS
	SELECT * from Commodities ORDER BY commmodity_name
GO

CREATE PROCEDURE dbo.uspGetGeographies
AS
	SELECT * from Geographies ORDER BY geography_name
GO

CREATE PROCEDURE dbo.uspGetTitles
AS
	SELECT * from Titles ORDER BY title
GO

CREATE PROCEDURE dbo.uspGetStatuses
AS
	SELECT * from Statuses ORDER BY status_name
GO

CREATE PROCEDURE dbo.uspGetAccessLevels
AS
	SELECT * from AccessLevels ORDER BY accesslevel_name
GO

CREATE PROCEDURE dbo.uspCreateNewAccount
	@orgName NVARCHAR(200),
	@orgAddress NVARCHAR(200),
	@orgWebsite NVARCHAR(200),
	@isSubsidiary BIT = 0,
	@orgParent NVARCHAR(200) = ''
AS
	INSERT INTO PendingAccounts VALUES(@orgName, @orgAddress, @orgWebsite, @isSubsidiary, @orgParent)
	SELECT SCOPE_IDENTITY() AS [organization_id];
GO

CREATE PROCEDURE dbo.uspCreateNewAccountClassifications
	@orgID INT,
	@classification_ids VARCHAR(200)
AS
	DECLARE @pos INT
	DECLARE @len INT
	DECLARE @strClassificationId varchar(20)
	DECLARE @nClassificationId INT

	SET @pos = 1
	WHILE CHARINDEX(',', @classification_ids, @pos) > 0
	BEGIN
		SET @len = CHARINDEX(',', @classification_ids, @pos)
		SET @strClassificationId = SUBSTRING(@classification_ids, @pos, @len - @pos)
		SET @nClassificationId = CAST(@strClassificationId AS INT)
		INSERT INTO PendingAccountsClassifications VALUES(@orgID, @nClassificationId)
		SET @pos = @len + 1
	END
	SET @strClassificationId = SUBSTRING(@classification_ids, @pos, LEN(@classification_ids) - @pos + 1)
	SET @nClassificationId = CAST(@strClassificationId AS INT)
	INSERT INTO PendingAccountsClassifications VALUES(@orgID, @nClassificationId)
GO

CREATE PROCEDURE dbo.uspCreateNewAccountUser
	@orgID INT,
	@firstName NVARCHAR(35),
	@mi NVARCHAR(2),
	@lastName NVARCHAR(35),
	@email NVARCHAR(50),
	@phone NVARCHAR(50),
	@titleId INT,
	@other_title NVARCHAR(150)
AS
	INSERT INTO [dbo].[PendingAccountsUsers] VALUES(@orgID, @firstName, @mi, @lastName, @email, @phone, @titleId, @other_title, 1, 1, 0)
	SELECT SCOPE_IDENTITY() AS [user_id];
GO

CREATE PROCEDURE dbo.uspCreateNewAccountUserGeographies
	@userID INT,
	@geography_ids VARCHAR(200)
AS
	DECLARE @pos INT
	DECLARE @len INT
	DECLARE @strGeographyId varchar(20)
	DECLARE @nGeographyId INT

	SET @pos = 1
	WHILE CHARINDEX(',', @geography_ids, @pos) > 0
	BEGIN
		SET @len = CHARINDEX(',', @geography_ids, @pos)
		SET @strGeographyId = SUBSTRING(@geography_ids, @pos, @len - @pos)
		SET @nGeographyId = CAST(@strGeographyId AS INT)
		INSERT INTO [dbo].[PendingAccountsUsersGeographies] VALUES(@userID, @nGeographyId)
		set @pos = @len +1
	END
	SET @strGeographyId = SUBSTRING(@geography_ids, @pos, LEN(@geography_ids) - @pos + 1)
	SET @nGeographyId = CAST(@strGeographyId AS INT)
	INSERT INTO [dbo].[PendingAccountsUsersGeographies] VALUES(@userID, @nGeographyId)
GO

CREATE PROCEDURE dbo.uspCreateNewAccountUserCommodities
	@userID INT,
	@commodity_ids VARCHAR(200)
AS
	DECLARE @pos INT
	DECLARE @len INT
	DECLARE @strCommodityId varchar(20)
	DECLARE @nCommodityId INT

	SET @pos = 1
	WHILE CHARINDEX(',', @commodity_ids, @pos) > 0
	BEGIN
		SET @len = CHARINDEX(',', @commodity_ids, @pos)
		SET @strCommodityId = SUBSTRING(@commodity_ids, @pos, @len - @pos)
		SET @nCommodityId = CAST(@strCommodityId AS INT)
		INSERT INTO [dbo].[PendingAccountsUsersCommodities] VALUES(@userID, @nCommodityId)
		set @pos = @len +1
	END
	SET @strCommodityId = SUBSTRING(@commodity_ids, @pos, LEN(@commodity_ids) - @pos + 1)
	SET @nCommodityId = CAST(@strCommodityId AS INT)
	INSERT INTO [dbo].[PendingAccountsUsersCommodities] VALUES(@userID, @nCommodityId)
GO

CREATE PROCEDURE dbo.uspAddPendingPolicy
	@orgID INT,
	@document_name NVARCHAR(250)
AS
	IF NOT EXISTS ( SELECT * FROM PendingAccountsPolicies
									WHERE organization_id = @orgID
									AND document_name = @document_name)
	INSERT INTO [dbo].[PendingAccountsPolicies]
	VALUES (@orgID, @document_name)
GO

CREATE PROCEDURE dbo.uspGetAllPolicyList
AS
	-- Create a Table Variable to store the compiled pending accounts data in.
	DECLARE @CompiledPendingAccounts TABLE
	(
	  [organization_id] INT NOT NULL,
		[document_name] NVARCHAR(200) NOT NULL
	)

	/************************************************************
	* NEXT: ADD INFO FROM ALL CREATED ACCOUNTS
	************************************************************/
	-- Setup a new cursor to go through each created account.
	DECLARE @organization_id INT
	DECLARE @organization_name NVARCHAR(200)
	DECLARE @organization_db NVARCHAR(200)
	DECLARE @organization_status_id INT
	DECLARE @TEMPLATE NVARCHAR(500)
	DECLARE @SQL NVARCHAR(500)
	DECLARE org_cursor CURSOR FOR
	SELECT
	id, organization_name, organization_db, organization_status_id FROM Organizations

	-- Loop Through each organization and create compiled data.
	OPEN org_cursor
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_db, @organization_status_id
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Setup SQL Query to get data from database.
		SET @TEMPLATE = 'EXEC [{DATABASENAME}].[dbo].[uspGetPolicyList] {ORGID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db)
		SET @SQL = REPLACE(@SQL, '{ORGID}', @organization_id)

		-- Insert Row with data into compiled table.
		--SELECT @SQL
		--EXEC sp_executesql @SQL
		INSERT INTO @CompiledPendingAccounts EXEC sp_executesql @SQL

		-- Fetch Next Row.
		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_db, @organization_status_id
	END
	CLOSE org_cursor
	DEALLOCATE org_cursor

	SELECT * FROM @CompiledPendingAccounts
GO

CREATE PROCEDURE dbo.uspGetPendingPolicyList
AS
	SELECT organization_id, document_name FROM PendingAccountsPolicies
GO

CREATE PROCEDURE uspGetLocationsCount
	@org_db NVARCHAR(200)
AS
	DECLARE @organization_db NVARCHAR(200)
	DECLARE @TEMPLATE NVARCHAR(1000)
	DECLARE @SQL NVARCHAR(2000)

	SET @organization_db = @org_db

	SET @TEMPLATE = '
		DECLARE @totalCount INT
		DECLARE @investmentCount INT
		DECLARE @commodityCount INT

		--Get the Total Count of all Lists.
		SELECT @totalCount = SUM(L.list_locations_count)
		FROM [{DATABASENAME}].dbo.Lists AS L
		JOIN Templates AS T ON L.template_id = T.id
		JOIN LocationType LT ON T.location_type_id = LT.id

		--Get the Investment Count of all Lists.
		SELECT @investmentCount = SUM(L.list_locations_count)
		FROM [{DATABASENAME}].dbo.Lists AS L
		JOIN Templates AS T ON L.template_id = T.id
		JOIN LocationType LT ON T.location_type_id = LT.id
		WHERE T.location_type_id = 1

		--Get the Total Count of all Lists.
		SELECT @commodityCount = SUM(L.list_locations_count)
		FROM [{DATABASENAME}].dbo.Lists AS L
		JOIN Templates AS T ON L.template_id = T.id
		JOIN LocationType LT ON T.location_type_id = LT.id
		WHERE T.location_type_id = 2

		SELECT @totalCount AS TotalCount, @investmentCount AS InvestmentCount, @commodityCount AS CommodityCount
	'
	SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE uspGetLocationsCountEditor
	@org_db NVARCHAR(200),
	@user_id INT
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	SET @TEMPLATE = '
		DECLARE @totalCount INT
		DECLARE @investmentCount INT
		DECLARE @commodityCount INT

		--Get the Total Count of all Lists.
		SELECT @totalCount = SUM(L.list_locations_count)
		FROM [{DATABASENAME}].dbo.Lists AS L
		JOIN Templates AS T ON L.template_id = T.id
		JOIN LocationType LT ON T.location_type_id = LT.id
		WHERE L.user_id = {USER_ID}

		--Get the Investment Count of all Lists.
		SELECT @investmentCount = SUM(L.list_locations_count)
		FROM [{DATABASENAME}].dbo.Lists AS L
		JOIN Templates AS T ON L.template_id = T.id
		JOIN LocationType LT ON T.location_type_id = LT.id
		WHERE T.location_type_id = 1 AND L.user_id = {USER_ID}

		--Get the Total Count of all Lists.
		SELECT @commodityCount = SUM(L.list_locations_count)
		FROM [{DATABASENAME}].dbo.Lists AS L
		JOIN Templates AS T ON L.template_id = T.id
		JOIN LocationType LT ON T.location_type_id = LT.id
		WHERE T.location_type_id = 2 AND L.user_id = {USER_ID}

		SELECT @totalCount AS TotalCount, @investmentCount AS InvestmentCount, @commodityCount AS CommodityCount
	'
	SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @org_db)
	SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspVerifyNewAccount
	@PendingAccountID INT
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	-- Obtain Organization Name.
	DECLARE @OrgName NVARCHAR(200)
	SELECT @OrgName = organization_name FROM PendingAccounts WHERE id = @PendingAccountID

	-- Use Master Database to verify the organization does not already have a db.
	IF @OrgName IS NOT NULL
		BEGIN
			SET @TEMPLATE = 'IF EXISTS(SELECT * FROM sys.databases WHERE name=[''{DATABASENAME}'']) SELECT 0 AS OrganizedVerified ELSE SELECT 1 AS OrganizationVerified'
			SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgName)
			EXEC sp_executesql @SQL
		END
	ELSE
		BEGIN
			SELECT 0 AS OrganizedVerified
		END
GO

CREATE PROCEDURE dbo.uspGetAllAccountsList
AS
	-- Create a Table Variable to store the compiled pending accounts data in.
	DECLARE @CompiledPendingAccounts TABLE
	(
		[organization_id] INT NOT NULL,
		[organization_name] NVARCHAR(200) NOT NULL,
		[organization_address] NVARCHAR(200) NOT NULL,
		[organization_website] NVARCHAR(200) NOT NULL,
		[organization_is_subsidiary] BIT NOT NULL,
		[organization_parent] NVARCHAR(200) NOT NULL,
		[organization_classifications_ids] NVARCHAR(100) NULL,
		[organization_status_id] INT,
		[organization_activated_time] SMALLDATETIME NULL
	)

	/************************************************************
	* FIRST: ADD INFO FROM ALL REQUESTED/PENDING ACCOUNTS
	************************************************************/
	-- Setup a new cursor to go through each pending account.
	DECLARE @organization_id INT,
			@organization_name NVARCHAR(200),
			@organization_address NVARCHAR(200),
			@organization_website NVARCHAR(200),
			@organization_is_subsidiary BIT,
			@organization_parent NVARCHAR(200)
	DECLARE org_cursor CURSOR FOR
	SELECT
	id, organization_name, organization_address, organization_website,
	organization_is_subsidiary, organization_parent FROM PendingAccounts

	-- Loop Through each pending account and create compiled data.
	OPEN org_cursor
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_address,
	@organization_website, @organization_is_subsidiary, @organization_parent
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Obtain Classifications Information for the Account.
		DECLARE @arrClassificationIds NVARCHAR(100)
		SELECT @arrClassificationIds = COALESCE(@arrClassificationIds + ',', '') + CONVERT(varchar(3), classification_id) FROM PendingAccountsClassifications WHERE pendingaccounts_id = @organization_id

		-- Insert Row with data into compiled table. (Assuming Pending = 1)
		INSERT INTO @CompiledPendingAccounts
		VALUES(@organization_id, @organization_name, @organization_address, @organization_website,
				@organization_is_subsidiary, @organization_parent, @arrClassificationIds, 1, NULL)

		-- Fetch Next Row.
		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_address,
		@organization_website, @organization_is_subsidiary, @organization_parent

		-- Reset arrays for next account.
		SET @arrClassificationIds = NULL
	END
	CLOSE org_cursor
	DEALLOCATE org_cursor

	/************************************************************
	* NEXT: ADD INFO FROM ALL CREATED ACCOUNTS
	************************************************************/
	-- Setup a new cursor to go through each created account.
	DECLARE @organization_db NVARCHAR(200)
	DECLARE @organization_status_id INT
	DECLARE @organization_activated_time SMALLDATETIME
	DECLARE @TEMPLATE NVARCHAR(500)
	DECLARE @SQL NVARCHAR(500)
	DECLARE org_cursor CURSOR FOR
	SELECT
	id, organization_name, organization_db, organization_status_id, organization_activated_time FROM Organizations

	-- Loop Through each organization and create compiled data.
	OPEN org_cursor
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_db, @organization_status_id, @organization_activated_time
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Setup SQL Query to get data from database.
		SET @TEMPLATE = 'EXEC [{DATABASENAME}].[dbo].[uspGetAccountProfile] {ORGID}, {ORGSTATUSID}'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db)
		SET @SQL = REPLACE(@SQL, '{ORGID}', @organization_id)
		SET @SQL = REPLACE(@SQL, '{ORGSTATUSID}', @organization_status_id)

		-- Insert Row with data into compiled table.
		--SELECT @SQL
		--EXEC sp_executesql @SQL
		INSERT INTO @CompiledPendingAccounts (organization_id, organization_name, organization_address, organization_website, organization_is_subsidiary, organization_parent, organization_classifications_ids, organization_status_id) EXEC sp_executesql @SQL
		UPDATE @CompiledPendingAccounts
		SET organization_activated_time = @organization_activated_time
		WHERE organization_id = @organization_id;
		-- Fetch Next Row.
		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_db, @organization_status_id, @organization_activated_time
	END
	CLOSE org_cursor
	DEALLOCATE org_cursor

	SELECT * FROM @CompiledPendingAccounts
GO

CREATE PROCEDURE dbo.uspGetAllUsersList
AS
	-- Create a Table Variable to store the compiled pending accounts data in.
	DECLARE @CompiledPendingAccounts TABLE
	(
		[organization_id] INT NOT NULL,
		[organization_name] NVARCHAR(200) NOT NULL,
		[first_name] NVARCHAR(35) NOT NULL,
		[middle_initial] NVARCHAR(2) NOT NULL,
		[last_name] NVARCHAR(35) NOT NULL,
		[email] NVARCHAR(50) NOT NULL,
		[phone] VARCHAR(50) NOT NULL,
		[title_id] INT NOT NULL,
		[other_title] NVARCHAR(150),
		[access_level_id] INT NOT NULL,
		[user_commodity_ids] NVARCHAR(100) NULL,
		[user_geography_ids] NVARCHAR(100) NULL,
		[email_subscription] BIT NOT NULL,
		[viirs_email_frequency] INT NOT NULL,
		[glad_email_frequency] INT NOT NULL,
		[forma_email_frequency] INT NOT NULL,
		[terrai_email_frequency] INT NOT NULL,
		[gran_chaco_email_frequency] INT NOT NULL,
		[auth_preference_id] INT NOT NULL,
		[user_status_id] INT NOT NULL,
		[user_activated_time] SMALLDATETIME NULL,
		[user_id] INT NULL
	)

	/************************************************************
	* FIRST: ADD INFO FROM ALL REQUESTED/PENDING USERS
	************************************************************/
	-- Setup a new cursor to go through each pending account.
	DECLARE @organization_id INT,
					@organization_name NVARCHAR(200)
	DECLARE user_cursor CURSOR FOR

	SELECT id, organization_name
	FROM PendingAccounts

	-- Loop Through each pending account and create compiled data.
	OPEN user_cursor
	FETCH NEXT FROM user_cursor
	INTO @organization_id, @organization_name
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Obtain User Information.
		DECLARE @userid INT
		DECLARE @first_name NVARCHAR(35)
		DECLARE @middle_initial NVARCHAR(2)
		DECLARE @last_name NVARCHAR(35)
		DECLARE @email NVARCHAR(50)
		DECLARE @phone VARCHAR(50)
		DECLARE @email_subscription INT
		DECLARE @viirsEmailFrequency INT
		DECLARE @gladEmailFrequency INT
		DECLARE @formaEmailFrequency INT
		DECLARE @terraiEmailFrequency INT
		DECLARE @granChacoEmailFrequency INT
		DECLARE @auth_preference_id INT
		DECLARE @title_id INT
		DECLARE @other_title NVARCHAR(150)
		DECLARE @access_level_id INT
		DECLARE @access_level VARCHAR(30)
		DECLARE @status_id INT
		DECLARE @status_level VARCHAR(30)
		SELECT @userid = id, @first_name = first_name, @middle_initial = middle_initial,
		@last_name = last_name, @email = email, @phone = phone, @title_id = title_id, @other_title = other_title,
		@access_level_id = access_level_id, @status_id = status_id,
		@email_subscription = email_subscription
		FROM PendingAccountsUsers WHERE pendingaccounts_id = @organization_id

		--There are no alerts for pending users, set to 0.
		SET @viirsEmailFrequency = 0
		SET @gladEmailFrequency = 0
		SET @formaEmailFrequency = 0
		SET @terraiEmailFrequency = 0
		SET @granChacoEmailFrequency = 0

		-- Obtain User Commodities Info.
		DECLARE @arrCommodities NVARCHAR(100)
		SELECT @arrCommodities = COALESCE(@arrCommodities + ',', '') + CONVERT(varchar(3), commodity_id)
		FROM PendingAccountsUsersCommodities WHERE pendingaccountsuser_id = @userid

		-- Obtain User Geographies Info.
		DECLARE @arrGeographies NVARCHAR(100)
		SELECT @arrGeographies = COALESCE(@arrGeographies + ',', '') + CONVERT(varchar(3), geography_id)
		FROM PendingAccountsUsersGeographies WHERE pendingaccountsuser_id = @userid

		-- Obtain Status Level from Id.
		SELECT @status_level = status_name FROM Statuses WHERE id = @status_id

		-- Obtain Access Level from Id.
		SELECT @access_level = accesslevel_name FROM AccessLevels WHERE id = @access_level_id

		-- Set Auth Preference.
		SET @auth_preference_id = 0

		-- Insert Row with data into compiled table.
		INSERT INTO @CompiledPendingAccounts
		VALUES(@organization_id, [@organization_name], @first_name, @middle_initial,
				@last_name, @email, @phone, @title_id, @other_title, @access_level_id, @arrCommodities,
				@arrGeographies, @email_subscription, @viirsEmailFrequency, @gladEmailFrequency,
				@formaEmailFrequency, @terraiEmailFrequency, @granChacoEmailFrequency,
				@auth_preference_id, @status_id, NULL, @userid)

		-- Fetch Next Row.
		FETCH NEXT FROM user_cursor
		INTO @organization_id, @organization_name

		--Reset arrays for next pass.
		SET @arrCommodities = NULL
		SET @arrGeographies = NULL
	END
	CLOSE user_cursor
	DEALLOCATE user_cursor

	/************************************************************
	* NEXT: ADD INFO FROM ALL USERS IN ALREADY CREATED ACCOUNTS
	************************************************************/
	-- Setup a new cursor to go through each created account.
	DECLARE @organization_db NVARCHAR(200)
	DECLARE @organization_status_id INT
	DECLARE @TEMPLATE NVARCHAR(1000)
	DECLARE @SQL NVARCHAR(1000)
	DECLARE org_cursor CURSOR FOR
	SELECT
	id, organization_name, organization_db, organization_status_id FROM Organizations

	-- Loop Through each organization and create compiled data.
	OPEN org_cursor
	FETCH NEXT FROM org_cursor
	INTO @organization_id, @organization_name, @organization_db, @organization_status_id
	WHILE  @@FETCH_STATUS = 0
	BEGIN
		-- Setup SQL Query to get data from database.
		SET @TEMPLATE = 'EXEC [{DATABASENAME}].[dbo].[uspGetAllUsersInfo] {ORGID}, [''{ORGNAME}'']'
		SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @organization_db)
		SET @SQL = REPLACE(@SQL, '{ORGID}', @organization_id)
		SET @SQL = REPLACE(@SQL, '{ORGNAME}', @organization_name)

		-- Insert Row with data into compiled table.
		--SELECT @SQL
		INSERT INTO @CompiledPendingAccounts EXEC sp_executesql @SQL

		-- Fetch Next Row.
		FETCH NEXT FROM org_cursor
		INTO @organization_id, @organization_name, @organization_db, @organization_status_id
	END
	CLOSE org_cursor
	DEALLOCATE org_cursor

	SELECT * FROM @CompiledPendingAccounts
GO

CREATE PROCEDURE dbo.uspGetOrganizationStatus
	@organizationId INT
AS
	SELECT organization_status_id FROM Organizations WHERE id = @organizationId
GO

CREATE PROCEDURE dbo.uspDeletePendingAccountRequest
	@PendingAccountID INT
AS
	-- Remove Data from Pending Account Table.
	DELETE FROM PendingAccounts WHERE id = @PendingAccountID

	-- Remove Data from Pending Accounts Classification Table.
	DELETE FROM PendingAccountsClassifications WHERE pendingaccounts_id = @PendingAccountID

	-- Remove Data from Pending Accounts Policies Table
	DELETE FROM PendingAccountsPolicies WHERE organization_id = @PendingAccountID

	-- Obtain User ID from Pending Accounts Users.
	DECLARE @PendingAccountUserID INT
	SELECT @PendingAccountUserID = id FROM PendingAccountsUsers WHERE pendingaccounts_id = @PendingAccountID

	--Remove Data from Pending Accounts Users Table.
	DELETE FROM PendingAccountsUsers WHERE id = @PendingAccountUserID

	--Remove Data from Pending Accounts Uers Commodities Table.
	DELETE FROM PendingAccountsUsersCommodities WHERE pendingaccountsuser_id = @PendingAccountUserID

	--Remove Data from Pending Accounts Uers Geographies Table.
	DELETE FROM PendingAccountsUsersGeographies WHERE pendingaccountsuser_id = @PendingAccountUserID
GO

CREATE PROCEDURE dbo.uspCreateNewUserRoute
	@userEmail NVARCHAR(50),
	@orgID INT,
	@OrgUserID INT,
	@OrgUserStatusID INT
AS
	INSERT INTO UserRoutes(user_email, organization_id, organization_user_id, organization_user_status_id)
	VALUES (@userEmail, @orgID, @OrgUserID, @OrgUserStatusID)
GO

CREATE PROCEDURE dbo.uspSetUserRouteStatus
	@orgID INT,
	@OrgUserID INT,
	@OrgUserStatusID INT
AS
	UPDATE UserRoutes SET organization_user_status_id = @OrgUserStatusID
	WHERE organization_id = @orgID AND organization_user_id = @OrgUserID

	SELECT UR.user_email, O.organization_name
	FROM UserRoutes UR
	LEFT JOIN Organizations O ON UR.organization_id = O.id
	WHERE UR.organization_id = @orgID AND UR.organization_user_id = @OrgUserID
GO

CREATE PROCEDURE dbo.uspUpdateEmailUserRoute
	@userRouteID INT,
	@userEmail NVARCHAR(50)
AS
	UPDATE UserRoutes SET user_email = @userEmail WHERE id = @userRouteID
GO

CREATE PROCEDURE dbo.uspGetInitialUserRouteInfo
	@userEmail NVARCHAR(50)
AS
	-- Get Results for all users that are not inactive.
	SELECT UR.user_email, US.user_secret, US.user_auth_preference_id
	FROM UserRoutes UR LEFT JOIN UserSecrets US ON UR.user_email = US.user_email
	WHERE UR.user_email = @userEmail AND UR.organization_user_status_id <> 3
GO

CREATE PROCEDURE dbo.uspGetVerifiedUserRouteInfo
	@userEmail NVARCHAR(50)
AS
	-- Get Results for all users that are not inactive.
	SELECT UR.user_email, US.user_secret, UR.organization_id, UR.organization_user_id,
	UR.organization_user_status_id, OG.organization_name, OG.organization_db, OG.organization_status_id
	FROM UserRoutes UR LEFT JOIN UserSecrets US ON UR.user_email = US.user_email
	LEFT JOIN Organizations OG ON UR.organization_id = OG.id
	WHERE UR.user_email = @userEmail AND UR.organization_user_status_id <> 3
GO


CREATE PROCEDURE dbo.uspGetGFWProRootUserInfo
	@userEmail NVARCHAR(50)
AS
	-- Get Results for all users that are not inactive.
	SELECT GUR.user_email, US.user_secret, US.user_auth_preference_id
	FROM [GFWProRootUserRoutes] GUR LEFT JOIN UserSecrets US ON GUR.user_email = US.user_email
	WHERE GUR.user_email = @userEmail  AND GUR.user_status_id <> 3
GO

CREATE PROCEDURE dbo.uspGetTemplateMetadata
AS
	SELECT
		TM.id,
		TM.template_id,
		TM.template_datum_field_name,
		TM.template_datum_field_description,
		TM.template_datum_type_id,
		TM.template_datum_mandatory,
		TM.template_datum_system,
		UT.ui_type,
		T.location_type_id,
		T.template_name,
		LT.location_type_name
	FROM TemplateMetadata TM
	LEFT JOIN UITypes UT on TM.template_datum_ui_id = UT.id
	LEFT JOIN Templates T ON TM.template_id = T.id
	LEFT JOIN LocationType LT ON T.location_type_id = LT.id
GO

CREATE PROCEDURE dbo.uspGetTemplatesDropdown
AS
	SELECT *
	FROM TemplateDropdowns

GO

CREATE PROCEDURE dbo.uspGetDataTypes
AS
	SELECT *
	FROM DataTypes

GO

CREATE PROCEDURE dbo.uspUpdatePendingAccount
	@orgID INT,
	@orgName NVARCHAR(200),
	@orgAddress NVARCHAR(200),
	@orgWebsite NVARCHAR(200),
	@isSubsidiary BIT = 0,
	@orgParent NVARCHAR(200) = '',
	@classification_ids NVARCHAR(200)
AS
	-- Update pending accounts table
	UPDATE PendingAccounts SET
		organization_name = @orgName,
		[organization_address] = @orgAddress,
		organization_website = @orgWebsite,
		organization_is_subsidiary = @isSubsidiary,
		organization_parent = @orgParent
	WHERE id=@orgID

	-- Delete classifications for the organization before re-adding
	DELETE FROM PendingAccountsClassifications WHERE pendingaccounts_id = @orgID

	-- Add the classifications for the organization
	DECLARE @pos INT
	DECLARE @len INT
	DECLARE @strClassificationId varchar(20)
	DECLARE @nClassificationId INT

	SET @pos = 1
	WHILE CHARINDEX(',', @classification_ids, @pos) > 0
	BEGIN
		SET @len = CHARINDEX(',', @classification_ids, @pos)
		SET @strClassificationId = SUBSTRING(@classification_ids, @pos, @len - @pos)
		SET @nClassificationId = CAST(@strClassificationId AS INT)
		INSERT INTO PendingAccountsClassifications VALUES(@orgID, @nClassificationId)
		SET @pos = @len + 1
	END
	SET @strClassificationId = SUBSTRING(@classification_ids, @pos, LEN(@classification_ids) - @pos + 1)
	SET @nClassificationId = CAST(@strClassificationId AS INT)
	INSERT INTO PendingAccountsClassifications VALUES(@orgID, @nClassificationId)
GO

CREATE PROCEDURE dbo.uspUpdatePendingAccountUser
	@firstName NVARCHAR(35),
	@mi NVARCHAR(2),
	@lastName NVARCHAR(35),
	@email NVARCHAR(50),
	@phone NVARCHAR(50),
	@titleId INT,
	@other_title NVARCHAR(150),
	@userID INT,
	@geography_ids NVARCHAR(200),
	@commodity_ids NVARCHAR(200)

AS
	-- Update pending account user table
	UPDATE PendingAccountsUsers SET
	first_name = @firstName,
	middle_initial = @mi,
	last_name = @lastName,
	email = @email,
	phone = @phone,
	title_id = @titleId,
	other_title = @other_title
	WHERE id = @userID

	-- Delete Pending Account User Commodities and Geographies before re-adding
	DELETE FROM PendingAccountsUsersCommodities WHERE pendingaccountsuser_id = @userID
	DELETE FROM PendingAccountsUsersGeographies WHERE pendingaccountsuser_id = @userID

	-- Add the classifications for the pending account user
	--- Commodities
	DECLARE @pos INT
	DECLARE @len INT
	DECLARE @strCommodityId varchar(20)
	DECLARE @nCommodityId INT

	SET @pos = 1
	WHILE CHARINDEX(',', @commodity_ids, @pos) > 0
	BEGIN
		SET @len = CHARINDEX(',', @commodity_ids, @pos)
		SET @strCommodityId = SUBSTRING(@commodity_ids, @pos, @len - @pos)
		SET @nCommodityId = CAST(@strCommodityId AS INT)
		INSERT INTO [dbo].[PendingAccountsUsersCommodities] VALUES(@userID, @nCommodityId)
		set @pos = @len +1
	END
	SET @strCommodityId = SUBSTRING(@commodity_ids, @pos, LEN(@commodity_ids) - @pos + 1)
	SET @nCommodityId = CAST(@strCommodityId AS INT)
	INSERT INTO [dbo].[PendingAccountsUsersCommodities] VALUES(@userID, @nCommodityId)

	--- Geographies
	DECLARE @strGeographyId varchar(20)
	DECLARE @nGeographyId INT

	SET @pos = 1
	WHILE CHARINDEX(',', @geography_ids, @pos) > 0
	BEGIN
		SET @len = CHARINDEX(',', @geography_ids, @pos)
		SET @strGeographyId = SUBSTRING(@geography_ids, @pos, @len - @pos)
		SET @nGeographyId = CAST(@strGeographyId AS INT)
		INSERT INTO [dbo].[PendingAccountsUsersGeographies] VALUES(@userID, @nGeographyId)
		set @pos = @len +1
	END
	SET @strGeographyId = SUBSTRING(@geography_ids, @pos, LEN(@geography_ids) - @pos + 1)
	SET @nGeographyId = CAST(@strGeographyId AS INT)
	INSERT INTO [dbo].[PendingAccountsUsersGeographies] VALUES(@userID, @nGeographyId)
GO

CREATE PROCEDURE dbo.uspGetActivityTypes
AS
	SELECT AT.id AS [ActivityTypeID], AT.activity_type_category_id AS [ActivityCategoryID],
	AC.activity_type_category_name AS [ActivityCategoryName], AT.activity_type_name AS [ActivityTypeName]
	FROM ActivityType AT
	JOIN ActivityTypeCategory AC ON AT.activity_type_category_id = AC.id
GO

CREATE PROCEDURE dbo.uspDeleteOrganization
(
@orgName NVARCHAR(200)
)
AS
	DECLARE @orgID INT
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @DBNAME NVARCHAR(200)

	SET @orgID = (SELECT id FROM Organizations where organization_name = @orgName)
	DELETE FROM UserRoutes where organization_id = @orgID
	DELETE FROM Organizations where organization_name = @orgName

	-- Removes spaces
	SET @ORGNAME = REPLACE(@ORGNAME, ' ', '')

	SET @DBNAME = '[clientstore-{ORGANIZATION}]'
	SET @DBNAME = REPLACE(@DBNAME, '{ORGANIZATION}', @ORGNAME)

	SET @SQL = 'DROP DATABASE IF EXISTS [{DATABASE}]'
	SET @SQL = REPLACE(@SQL, '{DATABASE}', @DBNAME)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspActivateUser
(
	@UserSecret NVARCHAR(50),
	@UserEmail NVARCHAR(50),
	@UserAuthPreferenceId INT
)
AS
-- Add Data to the User Secrets Table, if the user does not already exist.
		DECLARE @uCount INT
		DECLARE @userExists INT
		SET @userExists = 0

		SELECT @uCount = COUNT(*) FROM UserSecrets WHERE user_email = @UserEmail
		IF @uCount = 0
		BEGIN
			INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES(@UserEmail, @UserSecret, @UserAuthPreferenceId)
			SET @userExists = 1
		END
GO

-- Update authentication preference
CREATE PROCEDURE dbo.uspUpdateUserAuthenticationPreference (
	@user_email NVARCHAR(150),
	@user_auth_preference_id INT
)
AS
	UPDATE [UserSecrets]
	SET user_auth_preference_id = @user_auth_preference_id
	WHERE user_email = @user_email
GO

CREATE PROCEDURE dbo.uspDeleteUser
(
@email NVARCHAR(200)
)
AS
	DELETE FROM UserSecrets where user_email = @email
GO

CREATE  PROCEDURE dbo.uspCheckUserEmail
(
@email NVARCHAR(200)
)
AS
BEGIN
SELECT user_email FROM UserRoutes WHERE user_email=@email
END

GO

CREATE PROCEDURE uspGetTableQueryString
@template_id INT,
@custom_attribute_1 NVARCHAR(50) = NULL,
@custom_attribute_1_type NVARCHAR(50) = NULL,
@custom_attribute_2 NVARCHAR(50) = NULL,
@custom_attribute_2_type NVARCHAR(50) = NULL,
@custom_attribute_3 NVARCHAR(50) = NULL,
@custom_attribute_3_type NVARCHAR(50) = NULL
AS
-- Declare variables
DECLARE @tableQueryString NVARCHAR(MAX)

-- Add template column names and respective types
SELECT @tableQueryString = COALESCE(@tableQueryString + ',', '') + CONCAT('[', template_datum_field_name, '] ', DataTypes.data_type)
FROM TemplateMetadata
JOIN DataTypes ON template_datum_type_id = DataTypes.id
-- Ignore custom attributes
WHERE template_id = @template_id AND NOT (template_datum_field_name LIKE '%Attribute%')

-- Add custom columns if needed
IF (@custom_attribute_1 IS NOT NULL)
	SET @tableQueryString = CONCAT(@tableQueryString, ', [', @custom_attribute_1, '] ', @custom_attribute_1_type)
IF (@custom_attribute_2 IS NOT NULL)
	SET @tableQueryString = CONCAT(@tableQueryString, ', [', @custom_attribute_2, '] ', @custom_attribute_2_type)
IF (@custom_attribute_3 IS NOT NULL)
	SET @tableQueryString = CONCAT(@tableQueryString, ', [', @custom_attribute_3, '] ', @custom_attribute_3_type)

-- Add geometry column
SET @tableQueryString = CONCAT(@tableQueryString, ', [Geometry] geometry')
-- Add Primary Key column
SET @tableQueryString = CONCAT(@tableQueryString, ', [location_id] INT')
-- Add flagged columns
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_general] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_gran_chaco] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_glad] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_forma] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_viirs] INT')
SET @tableQueryString = CONCAT(@tableQueryString, ', [flag_terrai] INT')

SELECT @tableQueryString AS [query_string]
GO

CREATE PROCEDURE uspClearGFWList
	@list_table NVARCHAR(150),
	@analysis_table NVARCHAR(150)
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	SET @TEMPLATE = '
		DELETE FROM [{LIST_TABLE}]
		DELETE FROM [{ANALYSIS_TABLE}]

		UPDATE GFWLists
		SET list_locations_count = 0
		WHERE list_table_name = ''{LIST_TABLE}''
	'

	SET @SQL = REPLACE(@TEMPLATE, '{LIST_TABLE}', @list_table)
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @analysis_table)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE uspUpdateAnalysisTable
	@analysis_table NVARCHAR(150),
	@location_id INT
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	SET @TEMPLATE = 'INSERT INTO [{TABLE_NAME}] (location_id, location_status_id) VALUES({LOCATION_ID}, 1)'
	SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @analysis_table)
	SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
	EXEC sp_executesql @SQL
GO

/*
	STORED PROCEDURES FOR ANALYSIS
*/
CREATE PROCEDURE uspUpdateListAnalysisSuccessCount
	@list_name NVARCHAR(150)
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @listID INT

	--Get List ID for the list.
	SELECT @listID = id FROM GFWLists WHERE list_name = @list_name

	IF @listID IS NOT NULL
	BEGIN
		-- Update Success Count.
		SET @TEMPLATE = '
			BEGIN TRANSACTION
				UPDATE [GFWAnalyses]
				SET analysis_success_count = analysis_success_count + 1
				WHERE list_id = {LIST_ID}
			COMMIT TRANSACTION
		'

		SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listID)
		EXEC sp_executesql @SQL

		-- Return both success and fail counts.
		SET @TEMPLATE = '
			BEGIN TRANSACTION
				SELECT analysis_success_count, analysis_fail_count
				FROM [GFWAnalyses]
				WHERE list_id = {LIST_ID}
			COMMIT TRANSACTION
		'

		SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listID)
		EXEC sp_executesql @SQL
	END
GO

CREATE PROCEDURE uspUpdateListAnalysisFailCount
	@list_name NVARCHAR(150)
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @listID INT

	--Get List ID for the list.
	SELECT @listID = id FROM GFWLists WHERE list_name = @list_name

	IF @listID IS NOT NULL
	BEGIN
		-- Update Success Count.
		SET @TEMPLATE = '
			BEGIN TRANSACTION
				UPDATE [GFWAnalyses]
				SET analysis_fail_count = analysis_fail_count + 1
				WHERE list_id = {LIST_ID}
			COMMIT TRANSACTION
		'

		SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listID)
		EXEC sp_executesql @SQL

		-- Return both success and fail counts.
		SET @TEMPLATE = '
			BEGIN TRANSACTION
				SELECT analysis_success_count, analysis_fail_count
				FROM [GFWAnalyses]
				WHERE list_id = {LIST_ID}
			COMMIT TRANSACTION
		'

		SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listID)
		EXEC sp_executesql @SQL
	END
GO

CREATE PROCEDURE uspUpdateListAnalysisStatus
	@list_name NVARCHAR(150),
	@status_id INT
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @listID INT

	--Get List ID for the list.
	SELECT @listID = id FROM GFWLists WHERE list_name = @list_name

	SET @TEMPLATE = '
		UPDATE [GFWAnalyses]
		SET status_id = {STATUS_ID}
		WHERE list_id = {LIST_ID}
	'

	SET @SQL = REPLACE(@TEMPLATE, '{STATUS_ID}', @status_id)
	SET @SQL = REPLACE(@SQL, '{list_id}', @listID)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE uspUpdateListAnalysisNumberResult
	@list_name NVARCHAR(150),
	@column_name NVARCHAR(50),
	@value DECIMAL(18,6)
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @listID INT

	--Get List ID for the list.
	SELECT @listID = id FROM GFWLists WHERE list_name = @list_name

	SET @TEMPLATE = '
		BEGIN TRANSACTION
		UPDATE [GFWAnalyses]
		SET {COLUMN_NAME} = {VALUE}
		WHERE list_id = {LIST_ID}
		COMMIT TRANSACTION
	'

	SET @SQL = REPLACE(@TEMPLATE, '{COLUMN_NAME}', @column_name)
	SET @SQL = REPLACE(@SQL, '{VALUE}', @value)
	SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE uspUpdateListAnalysisStringResult
	@list_name NVARCHAR(150),
	@column_name NVARCHAR(50),
	@value VARCHAR(MAX)
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @listID INT

	--Get List ID for the list.
	SELECT @listID = id FROM GFWLists WHERE list_name = @list_name

	SET @TEMPLATE = '
		BEGIN TRANSACTION
			UPDATE [GFWAnalyses]
			SET {COLUMN_NAME} = ''{VALUE}''
			WHERE list_id = {LIST_ID}
		COMMIT TRANSACTION
	'

	SET @SQL = REPLACE(@TEMPLATE, '{COLUMN_NAME}', @column_name)
	SET @SQL = REPLACE(@SQL, '{VALUE}', @value)
	SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE uspGetAdministrativeAreasInfo
AS
	SELECT DISTINCT Country, State, [Sub State]
	FROM [list-administrativeAreas]
GO

CREATE PROCEDURE uspGetProtectedAreasInfo
AS
	SELECT DISTINCT [Location Name], [IUCN CAT], [Designation Type], Designation, Country, State, [Sub State]
	FROM [list-protectedAreas]
GO

CREATE PROCEDURE uspGetAdministrativeAreasData
	@country NVARCHAR(150),
	@states NVARCHAR(MAX),
	@sub_states NVARCHAR(MAX)
AS
	--Declare Variables.
	DECLARE @SQL NVARCHAR(MAX)

	--Setup query to filter results by country/state/substate.
	SET @SQL = 'SELECT
					[id],[Location Name],[Country],[State],[Sub State],[Latitude],[Longitude],[Location Classification],[Size],[gadmid],[location_id]
				FROM
					[gfwpro].[dbo].[list-administrativeAreas]
				WHERE
				Country = @country'

	--Filter by states, if states are provided.
	IF(LEN(@states) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [State] IN (SELECT [value] FROM STRING_SPLIT(@states, '',''))'
	END

	--Filter by sub states, if sub states are provided.
	IF(LEN(@sub_states) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [Sub State] IN (SELECT [value] FROM STRING_SPLIT(@sub_states, '',''))'
	END

	--Execute Query.
	 EXEC sp_executesql @SQL,
							N'@country NVARCHAR(150), @states NVARCHAR(MAX), @sub_states NVARCHAR(MAX)',
							@country, @states, @sub_states
GO

CREATE PROCEDURE uspGetProtectedAreasData
	@country NVARCHAR(150),
	@state NVARCHAR(150),
	@sub_state NVARCHAR(150),
	@selected_designation NVARCHAR(150),
	@selected_designation_type NVARCHAR(150),
	@selected_iucn NVARCHAR(150),
	@selected_names NVARCHAR(MAX)
AS
	--Declare Variables.
	DECLARE @SQL NVARCHAR(MAX)

	--Setup query to filter results by country/state/substate.
	SET @SQL = 'SELECT
					[id],[Location Name],[Latitude],[Longitude],[Country],[State],[Sub State],[Size],
					[IUCN CAT],[Designation Type],[Designation],[Location Classification],[gadmid],[globalid],[location_id]
				FROM
					[gfwpro].[dbo].[list-protectedAreas]
				WHERE
				Country = @country'

	--Filter by state, if state is provided.
	IF(LEN(@state) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [State] = @state'
	END

	--Filter by sub state, if sub state is provided.
	IF(LEN(@sub_state) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [Sub State] = @sub_state'
	END

	--Filter by selected designation, if provided.
	IF(LEN(@selected_designation) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [Designation] = @selected_designation'
	END

	--Filter by selected designation type, if provided.
	IF(LEN(@selected_designation_type) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [Designation Type] = @selected_designation_type'
	END

	--Filter by selected IUCN, if provided.
	IF(LEN(@selected_iucn) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [IUCN CAT] = @selected_iucn'
	END

	--Filter by Location Names, if location names are provided.
	IF(LEN(@selected_names) > 0)
	BEGIN
		SET @SQL = @SQL + ' AND [Location Name] IN (SELECT [value] FROM STRING_SPLIT(@selected_names, '',''))'
	END

	--Execute Query.
	 EXEC sp_executesql @SQL,
							N'@country NVARCHAR(150), @state NVARCHAR(150), @sub_state NVARCHAR(150), @selected_designation NVARCHAR(150), @selected_designation_type NVARCHAR(150), @selected_iucn NVARCHAR(150), @selected_names NVARCHAR(MAX)',
							@country, @state, @sub_state, @selected_designation, @selected_designation_type, @selected_iucn, @selected_names
GO

CREATE PROCEDURE uspGetListAnalysis
	@list_id INT
AS
	SELECT * FROM GFWAnalyses WHERE list_id = @list_id
GO

CREATE PROCEDURE uspUpdateGFWListLocationCount
	@list_table NVARCHAR(150)
AS
	DECLARE @SQL NVARCHAR(MAX)
	SET @SQL = 'UPDATE GFWLists SET list_locations_count = (SELECT COUNT (*) FROM [{TABLE_NAME}]) WHERE list_table_name = ''{TABLE_NAME}'''
	SET @SQL = REPLACE(@SQL, '{TABLE_NAME}', @list_table)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE uspUpdateGFWListStatus
	@list_table NVARCHAR(150)
AS
	DECLARE @SQL NVARCHAR(MAX)
	SET @SQL = 'UPDATE GFWLists SET list_status_id = 2 WHERE list_table_name = ''{TABLE_NAME}'''
	SET @SQL = REPLACE(@SQL, '{TABLE_NAME}', @list_table)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE uspUpdateGFWListAnalysisStatus
	@analysis_table NVARCHAR(150)
AS
	DECLARE @SQL NVARCHAR(MAX)
	SET @SQL = 'UPDATE [{ANALYSIS_TABLE}] SET location_status_id = 2'
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE uspGetGFWLists
AS
	SELECT * FROM GFWLists
GO

CREATE PROCEDURE uspUpdateAdministrativeAreas
	@Country NVARCHAR(150),
	@State NVARCHAR(150),
	@Substate NVARCHAR(150),
	@Latitude FLOAT,
	@Longitude FLOAT,
	@LocationClassification NVARCHAR(150),
	@Geometry NVARCHAR(MAX),
	@Size DECIMAL(18,6),
	@LocationName NVARCHAR(150),
	@location_id INT
AS
	INSERT INTO [temp-list-administrativeAreas] (
	[Country],
	[State],
	[Sub State],
	[Latitude],
	[Longitude],
	[Location Classification],
	[Geometry],
	[Size],
	[Location Name],
	[location_id])
	VALUES (@Country, @State, @Substate, @Latitude, @Longitude, @LocationClassification, @Geometry, @Size, @LocationName, @location_id)
GO

CREATE PROCEDURE uspUpdateOilPalmConcessions
	@LocationName NVARCHAR(150),
	@Latitude FLOAT,
	@Longitude FLOAT,
	@Country NVARCHAR(150),
	@Company NVARCHAR(150),
	@AnalysisArea DECIMAL(18, 6),
	@ParentCompany NVARCHAR(150),
	@Certification NVARCHAR(150),
	@LocationClassification NVARCHAR(150),
	@Commodity NVARCHAR(150),
	@State NVARCHAR(150),
	@Substate NVARCHAR(150),
	@Geometry NVARCHAR(MAX),
	@location_id INT
AS
	INSERT INTO [temp-list-oilPalmConcessions] (
	[Location Name],
	[Latitude],
	[Longitude],
	[Country],
	[Company],
	[Analysis Area],
	[Parent Company],
	[Certification],
	[Location Classification],
	[Commodity],
	[State],
	[Sub State],
	[Geometry],
	[location_id])
	VALUES (@LocationName, @Latitude, @Longitude, @Country, @Company, @AnalysisArea, @ParentCompany, @Certification, @LocationClassification, @Commodity, @State, @Substate, @Geometry, @location_id)
GO

CREATE PROCEDURE uspUpdatePalmOilMills
	@LocationName NVARCHAR(150),
	@AnalysisRadius DECIMAL(18, 6),
	@Size DECIMAL(18, 6),
	@ParentCompany NVARCHAR(150),
	@Certification NVARCHAR(150),
	@RSPOModel NVARCHAR(150),
	@Latitude FLOAT,
	@Longitude FLOAT,
	@LocationClassification NVARCHAR(150),
	@Commodity NVARCHAR(150),
	@Country NVARCHAR(150),
	@State NVARCHAR(150),
	@Substate NVARCHAR(150),
	@MillID NVARCHAR(150),
	@AlternativeName NVARCHAR(150),
	@Geometry NVARCHAR(MAX),
	@location_id INT
AS
	INSERT INTO [temp-list-palmOilMills] (
	[Location Name],
	[Analysis Radius],
	[Size],
	[Parent Company],
	[Certification],
	[RSPO Model],
	[Latitude],
	[Longitude],
	[Location Classification],
	[Commodity],
	[Country],
	[State],
	[Sub State],
	[Mill ID],
	[Alternative Name],
	[Geometry],
	[location_id])
	VALUES (@LocationName, @AnalysisRadius, @Size, @ParentCompany, @Certification, @RSPOModel, @Latitude, @Longitude, @LocationClassification, @Commodity, @Country, @State, @Substate, @MillID, @AlternativeName, @Geometry, @location_id)
GO

CREATE PROCEDURE uspUpdateRspoOilPalmConcessions
	@LocationName NVARCHAR(150),
	@Latitude FLOAT,
	@Longitude FLOAT,
	@Country NVARCHAR(150),
	@Company NVARCHAR(150),
	@AnalysisArea DECIMAL(18, 6),
	@ParentCompany NVARCHAR(150),
	@Certification NVARCHAR(150),
	@LocationClassification NVARCHAR(150),
	@Commodity NVARCHAR(150),
	@State NVARCHAR(150),
	@Substate NVARCHAR(150),
	@Geometry NVARCHAR(MAX),
	@location_id INT
AS
	INSERT INTO [temp-list-rspoOilPalmConcessions] (
	[Location Name],
	[Latitude],
	[Longitude],
	[Country],
	[Company],
	[Analysis Area],
	[Parent Company],
	[Certification],
	[Location Classification],
	[Commodity],
	[State],
	[Sub State],
	[Geometry],
	[location_id])
	VALUES (@LocationName, @Latitude, @Longitude, @Country, @Company, @AnalysisArea, @ParentCompany, @Certification, @LocationClassification, @Commodity, @State, @Substate, @Geometry, @location_id)
GO

CREATE PROCEDURE uspUpdateProtectedAreas
	@LocationName NVARCHAR(150),
	@Latitude FLOAT,
	@Longitude FLOAT,
	@Country NVARCHAR(150),
	@State NVARCHAR(150),
	@Substate NVARCHAR(150),
	@AnalysisArea DECIMAL(18, 6),
	@IUCN_CAT NVARCHAR(150),
	@DesignationType NVARCHAR(150),
	@Designation NVARCHAR(150),
	@LocationClassification NVARCHAR(150),
	@Geometry NVARCHAR(MAX),
	@location_id INT
AS
	INSERT INTO [temp-list-protectedAreas] (
	[Location Name],
	[Latitude],
	[Longitude],
	[Country],
	[State],
	[Sub State],
	[Size],
	[IUCN CAT],
	[Designation Type],
	[Designation],
	[Location Classification],
	[Geometry],
	[location_id])
	VALUES (@LocationName, @Latitude, @Longitude, @Country, @State, @Substate, @AnalysisArea, @IUCN_CAT, @DesignationType, @Designation, @LocationClassification, @Geometry, @location_id)
GO

CREATE PROCEDURE dbo.uspSetOrganizationStatus
	@organization_id INT,
	@organization_status_id INT
AS
	UPDATE [Organizations] SET organization_status_id = @organization_status_id WHERE id = @organization_id
GO

CREATE PROCEDURE dbo.uspSetOrganizationUserStatus
	@organization_id INT,
	@organization_status_id INT
AS
	UPDATE [UserRoutes] SET organization_user_status_id = @organization_status_id WHERE organization_id = @organization_id
GO

CREATE PROCEDURE uspCreateAnalysisTable
	@list_analysis_table_name NVARCHAR(150)
AS
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	SET @TEMPLATE = '
		CREATE TABLE [{TABLE_NAME}]
		(
			[location_id] INT NOT NULL,
			[location_status_id] INT NOT NULL,

			[tree_cover_loss_total_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_peat_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_intact_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_protected_areas_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_sea_landcover_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_idn_landcover_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_idn_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_soy_yearly] NVARCHAR(2000) DEFAULT ''{}'',
			[tree_cover_loss_idn_legal_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_idn_forest_moratorium_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_prodes_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_prodes_wdpa_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_prodes_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_brazil_biomes_yearly] NVARCHAR(MAX) DEFAULT ''{}'',

			[tree_cover_extent_total] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_primary_forest] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_protected_areas] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_peat] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_intact_forest] DECIMAL(18, 6) DEFAULT 0.00000,

			[natural_habitat_primary] DECIMAL(18, 6) DEFAULT 0.00000,
			[natural_habitat_intact_forest] DECIMAL(18,6) DEFAULT 0.000000,
			[natural_habitat_global_land_cover] NVARCHAR(MAX) DEFAULT ''{}'',

			[total_area] DECIMAL(18, 6) DEFAULT 0.00000,
			[protected_areas_area] DECIMAL(18,6) DEFAULT 0.000000,
			[critical_habitat_alliance_zero] DECIMAL(18,6) DEFAULT 0.000000,
			[indigenous_people_land_rights] DECIMAL(18,6) DEFAULT 0.000000,
			[peat_area] DECIMAL(18,6) DEFAULT 0.000000,
			[fires_counts_monthly] NVARCHAR(MAX) DEFAULT '''',
			[soy_total_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[soy_pre2001_nonforest_area] DECIMAL(18, 6)  DEFAULT 0.00000,
			[brazil_biomes] NVARCHAR(MAX) DEFAULT ''{}'',
			[idn_legal_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[sea_landcover_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[idn_landcover_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[idn_forest_moratorium_area] DECIMAL(18, 6) DEFAULT 0.00000,

			[south_america_presence] NVARCHAR(50) DEFAULT ''false'',
			[legal_amazon_presence] NVARCHAR(50) DEFAULT ''false'',
			[brazil_biomes_presence] NVARCHAR(50) DEFAULT ''false'',
			[cerrado_biome_presence] NVARCHAR(50) DEFAULT ''false'',
			[southeast_asia_presence] NVARCHAR(50) DEFAULT ''false'',
			[indonesia_presence] NVARCHAR(50) DEFAULT ''false'',

			[commodity_threat_deforestation_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_peat_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_protected_areas_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_fires_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_overall_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_forest_extent_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_peat_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_protected_areas_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_overall_level] NVARCHAR(MAX) DEFAULT ''{}'',

			[commodity_value_forest_extent] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_peat] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_protected_areas] NVARCHAR(MAX) DEFAULT ''{}'',

			[commodity_mill_priority_level] NVARCHAR(MAX) DEFAULT ''{}'',

			[commodity_threat_deforestation] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_peat] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_protected_areas] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_fires] NVARCHAR(MAX) DEFAULT ''{}'',
			[dissolved_data_location_info] NVARCHAR(300) DEFAULT ''{}''
		)
	'

	SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @list_analysis_table_name)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE uspGetGFWListLocations
	@listID INT
AS
	--DECLARE IMPORTANT VARIABLES
	DECLARE @listLocationTableName NVARCHAR(1000)
	DECLARE @listLocationTableCols NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	-- Obtain the location table name and the analysis table name for the list.
	SELECT @listLocationTableName = list_table_name FROM GFWLists WHERE id = @listID
	-- Obtain the needed columns from the List Location Table. (All but Geometry)
	SELECT @listLocationTableCols = STUFF(
		(
			SELECT '], L.[' + [name] FROM sys.columns
			WHERE
				[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
				AND [name] NOT IN ('Geometry')
				FOR XML PATH('')
		),1,3,'') + ']';

	-- Return data from both tables
	SET @SQL = 'SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS}, L.Geometry.ToString() as [WKTGeometry] FROM [{LOCATION_TABLE}] L'
	SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
	SET @SQL = REPLACE(@SQL, '{LOCATION_COLUMNS}', @listLocationTableCols);
	SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspGetGFWDashboardListLocations
	@listId INT
AS
	DECLARE @listTable NVARCHAR(1000)
	DECLARE @analysisTable NVARCHAR(1000)
	SELECT @listTable = list_table_name, @analysisTable = list_analysis_table_name FROM GFWLists WHERE id = @listId

	DECLARE @SQL NVARCHAR(MAX)
	SET @SQL = '
		SELECT {LIST_ID} AS list_id,LT.[location_id],LT.[Location Name],LT.[Country],LT.[State],LT.[Sub State],LT.[gadmid],LT.Geometry.ToString() AS [WKTGeometry]
		FROM [{LIST_TABLE}] LT JOIN [{ANALYSIS_TABLE}] AT
		ON LT.location_id = AT.location_id
		WHERE AT.location_status_id = 2
	'
	SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listId)
	SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @listTable)
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @analysisTable)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspGetGFWDashboardDissolvedS3Location
	@listId INT
AS
	SELECT dissolved_data_location_info FROM GFWAnalyses WHERE list_id = @listId
GO


CREATE PROCEDURE dbo.uspGetPendingAccountInformation
	@pendingaccount_id INT
AS
	SELECT PendingAccounts.organization_name,
		PendingAccounts.organization_is_subsidiary,
		PendingAccounts.organization_parent,
		PendingAccounts.organization_website,
		PendingAccounts.organization_address,
		PendingAccountsUsers.id,
		PendingAccountsUsers.first_name,
		PendingAccountsUsers.last_name,
		PendingAccountsUsers.title_id,
		PendingAccountsUsers.other_title,
		PendingAccountsUsers.email,
		PendingAccountsUsers.phone
	FROM PendingAccountsUsers
	LEFT JOIN PendingAccounts on PendingAccountsUsers.pendingaccounts_id = PendingAccounts.id
	WHERE pendingaccounts_id = @pendingaccount_id
GO

CREATE PROCEDURE dbo.uspGetPendingUserCommodities
	@pending_user_id INT
AS
	SELECT commodity_id FROM PendingAccountsUsersCommodities WHERE pendingaccountsuser_id = @pending_user_id
GO

CREATE PROCEDURE dbo.uspGetPendingUserGeographies
	@pending_user_id INT
AS
	SELECT geography_id FROM PendingAccountsUsersGeographies WHERE pendingaccountsuser_id = @pending_user_id
GO

CREATE PROCEDURE dbo.uspGetPendingAccountPolicies
	@pending_organization_id INT
AS
	SELECT document_name FROM PendingAccountsPolicies WHERE organization_id = @pending_organization_id
GO

CREATE PROCEDURE dbo.uspGetPendingAccountClassification
	@pending_organization_id INT
AS
	SELECT classification_id FROM PendingAccountsClassifications WHERE pendingaccounts_id = @pending_organization_id
GO

-- GFW List Analysis Stored Procedures
CREATE PROCEDURE dbo.uspGetLocation
    @list_table NVARCHAR(150),
    @location_id INT
AS
    DECLARE @LIST_TEMPLATE_ID INT
    DECLARE @LOCATION_CLASSIFICATION NVARCHAR(150)
    DECLARE @SQL NVARCHAR(MAX)
    SET @LIST_TEMPLATE_ID = 2
    SET @SQL = '
        SELECT location_id, {LIST_TEMPLATE_ID} AS [template_id], [Location Classification] AS location_classification, Geometry.ToString() as [WKTGeometry]
        FROM [{TABLE_NAME}] WHERE location_id = {LOCATION_ID}
    '
    SET @SQL = REPLACE(@SQL, '{TABLE_NAME}', @list_table)
    SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
    SET @SQL = REPLACE(@SQL, '{LIST_TEMPLATE_ID}', @LIST_TEMPLATE_ID)

    EXEC sp_executesql @SQL

GO

CREATE PROCEDURE dbo.uspGetAllLocations
							@list_table NVARCHAR(150)
						AS
							DECLARE @LIST_TEMPLATE_ID INT
							DECLARE @LOCATION_CLASSIFICATION NVARCHAR(150)
							DECLARE @TEMPLATE NVARCHAR(MAX)
							DECLARE @SQL NVARCHAR(MAX)

							--Set the Template ID and the location classification manually.
							SET @LIST_TEMPLATE_ID = 2
							SET @LOCATION_CLASSIFICATION = 'Supply Shed'

							SET @TEMPLATE = '
								SELECT location_id, {LIST_TEMPLATE_ID} AS [template_id], ''{LOCATION_CLASSIFICATION}'' AS location_classification, Geometry.ToString() as [WKTGeometry]
								FROM [{TABLE_NAME}]
								'
								SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @list_table)
								SET @SQL = REPLACE(@SQL, '{LIST_TEMPLATE_ID}', @LIST_TEMPLATE_ID)
								SET @SQL = REPLACE(@SQL, '{LOCATION_CLASSIFICATION}', @LOCATION_CLASSIFICATION)
								EXEC sp_executesql @SQL
GO


CREATE PROCEDURE dbo.uspUpdateListStatus
    @list_table NVARCHAR(150),
    @analysis_table NVARCHAR(150)
AS
    DECLARE @SQL NVARCHAR(MAX)
    SET @SQL = '
        DECLARE @pendingListAnalysisCount INT
        DECLARE @pendingLocationAnalysisCount INT
        DECLARE @listAvailable INT

        --Check if the list is still pending.
        SELECT @pendingListAnalysisCount = COUNT(*) FROM GFWAnalyses WHERE
        list_id = (SELECT id FROM GFWLists WHERE list_table_name = ''{LIST_TABLENAME}'')
        AND status_id = 1

        --Check if there are any locations still pending.
		SELECT @pendingLocationAnalysisCount = COUNT(*) FROM [{ANALYSIS_TABLENAME}] WHERE location_status_id = 1

        IF (@pendingListAnalysisCount = 0 AND @pendingLocationAnalysisCount = 0)
		    BEGIN
				UPDATE GFWLists SET list_status_id = 2 WHERE list_table_name = ''{LIST_TABLENAME}''
				SET @listAvailable = 1
			END
		ELSE
			BEGIN
			    UPDATE GFWLists SET list_status_id = 1 WHERE list_table_name = ''{LIST_TABLENAME}''
				SET @listAvailable = 0
			END

		SELECT @listAvailable AS ListAvailable
    '
    SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLENAME}', @analysis_table)
    SET @SQL = REPLACE(@SQL, '{LIST_TABLENAME}', @list_table)
    EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspUpdateLocationAnalysisNumberResult
	@analysis_table_name NVARCHAR(150),
	@location_id INT,
	@column_name NVARCHAR(50),
	@value DECIMAL(18,6)
AS
	DECLARE @SQL NVARCHAR(MAX)
	SET @SQL = 'BEGIN TRANSACTION UPDATE [{ANALYSIS_TABLE}] SET {COLUMN_NAME} = {VALUE} WHERE location_id = {LOCATION_ID} COMMIT TRANSACTION'
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @analysis_table_name)
	SET @SQL = REPLACE(@SQL, '{COLUMN_NAME}', @column_name)
	SET @SQL = REPLACE(@SQL, '{VALUE}', @value)
	SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspUpdateLocationAnalysisStringResult
	@analysis_table_name NVARCHAR(150),
	@location_id INT,
	@column_name NVARCHAR(50),
	@value VARCHAR(MAX)
AS
	DECLARE @SQL NVARCHAR(MAX)
	SET @SQL = 'BEGIN TRANSACTION UPDATE [{ANALYSIS_TABLE}] SET {COLUMN_NAME} = ''{VALUE}'' WHERE location_id = {LOCATION_ID} COMMIT TRANSACTION'
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @analysis_table_name)
	SET @SQL = REPLACE(@SQL, '{COLUMN_NAME}', @column_name)
	SET @SQL = REPLACE(@SQL, '{VALUE}', @value)
	SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspUpdateLocationAnalysisStatus
	@analysis_table_name NVARCHAR(150),
	@location_id INT,
	@location_status_id INT
AS
	DECLARE @SQL NVARCHAR(MAX)
	SET @SQL = 'UPDATE [{ANALYSIS_TABLE}] SET location_status_id = {LOCATION_STATUS_ID} WHERE location_id = {LOCATION_ID}'
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @analysis_table_name)
	SET @SQL = REPLACE(@SQL, '{LOCATION_STATUS_ID}', @location_status_id)
	SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
	EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspGetFailedLocationNames
    @list_table NVARCHAR(150),
    @analysis_table NVARCHAR(150)
AS
    DECLARE @SQL NVARCHAR(MAX)
    SET @SQL = 'SELECT [Location Name] FROM [{LIST_TABLE}] l INNER JOIN [{ANALYSIS_TABLE}] a ON l.location_id = a.location_id WHERE a.location_status_id = 3'
    SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @list_table)
    SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @analysis_table)
    EXEC sp_executesql @SQL
GO

CREATE PROCEDURE dbo.uspGetAdministrativeAreaAttributes
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
         SELECT 1 AS [list_id],id,[Location Name],Country,State,[Sub State],Latitude,Longitude,[Location Classification],Size,location_id FROM [list-administrativeAreas]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 1 AS [list_id],id,[Location Name],Country,State,[Sub State],Latitude,Longitude,[Location Classification],Size,location_id FROM [list-administrativeAreas] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END
GO

CREATE PROCEDURE dbo.uspGetOilPalmConcessionsAttributes
    @location_ids NVARCHAR(MAX) = NULL
AS
IF @location_ids IS NULL OR @location_ids = ''
    SELECT 2 AS [list_id],[Location Name],Latitude,Longitude,Country,State,[Sub State],Company,[Analysis Area],[Parent Company],Certification,[Location Classification],Commodity,[gadmid],globalid,location_id FROM [list-oilPalmConcessions]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 2 AS [list_id],[Location Name],Latitude,Longitude,Country,State,[Sub State],Company,[Analysis Area],[Parent Company],Certification,[Location Classification],Commodity,[gadmid],globalid,location_id FROM [list-oilPalmConcessions] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
    END
GO

CREATE PROCEDURE dbo.uspGetPalmOilMillAttributes
    @location_ids NVARCHAR(MAX) = NULL
AS
IF @location_ids IS NULL OR @location_ids = ''
    SELECT 3 AS [list_id],[Location Name],[Analysis Radius],Size,[Parent Company],[Company ID],Certification,[RSPO Model],Latitude,Longitude,[Location Classification],Commodity,Country,State,[Sub State],[Mill ID],[Alternative Name],[gadmid],globalid,location_id
    FROM [list-palmOilMills]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 3 AS [list_id],[Location Name],[Analysis Radius],Size,[Parent Company],[Company ID],Certification,[RSPO Model],Latitude,Longitude,[Location Classification],Commodity,Country,State,[Sub State],[Mill ID],[Alternative Name],[gadmid],globalid,location_id FROM [list-palmOilMills] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
    END
GO

CREATE PROCEDURE dbo.uspGetProtectedAreaAttributes
    @location_ids NVARCHAR(MAX) = NULL
AS
IF @location_ids IS NULL OR @location_ids = ''
    SELECT 4 AS [list_id],[Location Name],Latitude,Longitude,Country,State,[Sub State],[Size],[IUCN CAT],[Designation Type],Designation,[Location Classification],globalid,location_id
FROM [list-protectedAreas]
    ELSE
        BEGIN
    DECLARE @SQL NVARCHAR(MAX)
    SET @SQL = 'SELECT 4 AS [list_id],[Location Name],Latitude,Longitude,Country,State,[Sub State],[Size],[IUCN CAT],[Designation Type],Designation,[Location Classification],globalid,location_id FROM [list-protectedAreas] WHERE location_id IN ({LOCATION_IDS})'
    SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
    EXEC sp_executesql @SQL
END
GO

CREATE PROCEDURE dbo.uspGetRSPOOilPalmConcessionsAttributes
	@location_ids NVARCHAR(MAX) = NULL
AS
IF @location_ids IS NULL OR @location_ids = ''
    	SELECT 5 AS [list_id],[Location Name],Company,[Parent Company],Certification,Latitude,Longitude,[Location Classification],Commodity,Country,State,[Sub State],[gadmid],globalid,location_id,[Analysis Area]
		FROM [list-rspoOilPalmConcessions]
    ELSE
        BEGIN
	DECLARE @SQL NVARCHAR(MAX)
	SET @SQL = 'SELECT 5 AS [list_id],[Location Name],Company,[Parent Company],Certification,Latitude,Longitude,[Location Classification],Commodity,Country,State,[Sub State],[gadmid],globalid,location_id,[Analysis Area] FROM [list-rspoOilPalmConcessions] WHERE location_id IN ({LOCATION_IDS})'
	SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
	EXEC sp_executesql @SQL
END
GO

CREATE PROCEDURE dbo.uspGetAdministrativeAreasGeom
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
        SELECT 1 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-administrativeAreas]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 1 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-administrativeAreas] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END

GO

CREATE PROCEDURE dbo.uspGetOilPalmConcessionsGeom
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
        SELECT 2 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-oilPalmConcessions]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 2 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-oilPalmConcessions] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END
GO

CREATE PROCEDURE dbo.uspGetPalmOilMillsGeom
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
        SELECT 3 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-palmOilMills]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 3 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-palmOilMills] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END
GO

CREATE PROCEDURE dbo.uspGetProtectedAreasGeom
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
        SELECT 4 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-protectedAreas]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 4 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-protectedAreas] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END
GO

CREATE PROCEDURE dbo.uspGetRSPOOilPalmConcessionsGeom
    @location_ids NVARCHAR(MAX) = NULL
AS
    IF @location_ids IS NULL OR @location_ids = ''
        SELECT 5 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-rspoOilPalmConcessions]
    ELSE
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT 5 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-rspoOilPalmConcessions] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL
        END
GO

CREATE PROCEDURE dbo.uspGetProtectedAreasGlobalId
    @global_ids NVARCHAR(MAX) = NULL
AS
    IF @global_ids IS NULL OR @global_ids = ''
        BEGIN
            SELECT id, [Location Name], Latitude, Longitude, Country, State, [Sub State], Size, [IUCN CAT], [Designation Type], Designation, [Location Classification], gadmid, globalid, location_id FROM [gfwpro].[dbo].[list-protectedAreas]
            SELECT * FROM [analysis-protectedAreas]
        END
    ELSE
        BEGIN
            DECLARE @LIST_SQL NVARCHAR(MAX)
            SET @LIST_SQL = 'SELECT id, [Location Name], Latitude, Longitude, Country, State, [Sub State], Size, [IUCN CAT], [Designation Type], Designation, [Location Classification], gadmid, globalid, location_id FROM [gfwpro].[dbo].[list-protectedAreas] WHERE globalid IN ({GLOBAL_IDS})'
            SET @LIST_SQL = REPLACE(@LIST_SQL, '{GLOBAL_IDS}', @global_ids)
            EXEC sp_executesql @LIST_SQL

            DECLARE @ANALYSIS_SQL NVARCHAR(MAX)
            SET @ANALYSIS_SQL = 'SELECT * FROM [analysis-protectedAreas] WHERE location_id IN (SELECT location_id FROM [list-protectedAreas] WHERE globalid IN ({GLOBAL_IDS}))'
            SET @ANALYSIS_SQL = REPLACE(@ANALYSIS_SQL, '{GLOBAL_IDS}', @global_ids)
            EXEC sp_executesql @ANALYSIS_SQL
        END
GO

CREATE PROCEDURE dbo.uspGetPalmOilMillsGlobalId
    @global_ids NVARCHAR(MAX) = NULL
AS
    IF @global_ids IS NULL OR @global_ids = ''
        BEGIN
            SELECT 3 AS [list_id],[Location Name],[Analysis Radius],Size,[Parent Company],[Company ID],Certification,[RSPO Model],Latitude,Longitude,[Location Classification],Commodity,Country,State,[Sub State],[Mill ID],[Alternative Name],[gadmid],globalid,location_id FROM [gfwpro].[dbo].[list-palmOilMills]
            SELECT * FROM [gfwpro].[dbo].[analysis-palmOilMills]
        END
    ELSE
        BEGIN
            DECLARE @LIST_SQL NVARCHAR(MAX)
            SET @LIST_SQL = 'SELECT 3 AS [list_id],[Location Name],[Analysis Radius],Size,[Parent Company],[Company ID],Certification,[RSPO Model],Latitude,Longitude,[Location Classification],Commodity,Country,State,[Sub State],[Mill ID],[Alternative Name],[gadmid],globalid,location_id FROM [gfwpro].[dbo].[list-palmOilMills] WHERE globalid IN ({GLOBAL_IDS})'
            SET @LIST_SQL = REPLACE(@LIST_SQL, '{GLOBAL_IDS}', @global_ids)
            EXEC sp_executesql @LIST_SQL

            DECLARE @ANALYSIS_SQL NVARCHAR(MAX)
            SET @ANALYSIS_SQL = 'SELECT * FROM [analysis-palmOilMills] WHERE location_id IN (SELECT location_id FROM [list-palmOilMills] WHERE globalid IN ({GLOBAL_IDS}))'
            SET @ANALYSIS_SQL = REPLACE(@ANALYSIS_SQL, '{GLOBAL_IDS}', @global_ids)
            EXEC sp_executesql @ANALYSIS_SQL
        END
GO

CREATE PROCEDURE dbo.uspGetOilPalmConcessionsGlobalId
    @global_ids NVARCHAR(MAX) = NULL
AS
    IF @global_ids IS NULL OR @global_ids = ''
        BEGIN
            SELECT 2 AS [list_id],[Location Name],Latitude,Longitude,Country,State,[Sub State],Company,[Analysis Area],[Parent Company],Certification,[Location Classification],Commodity,[gadmid],globalid,location_id FROM [gfwpro].[dbo].[list-oilPalmConcessions]
            SELECT * FROM [gfwpro].[dbo].[analysis-oilPalmConcessions]
        END
    ELSE
        BEGIN
            DECLARE @LIST_SQL NVARCHAR(MAX)
            SET @LIST_SQL = 'SELECT 2 AS [list_id],[Location Name],Latitude,Longitude,Country,State,[Sub State],Company,[Analysis Area],[Parent Company],Certification,[Location Classification],Commodity,[gadmid],globalid,location_id FROM [gfwpro].[dbo].[list-oilPalmConcessions] WHERE globalid IN ({GLOBAL_IDS})'
            SET @LIST_SQL = REPLACE(@LIST_SQL, '{GLOBAL_IDS}', @global_ids)
            EXEC sp_executesql @LIST_SQL

            DECLARE @ANALYSIS_SQL NVARCHAR(MAX)
            SET @ANALYSIS_SQL = 'SELECT * FROM [analysis-oilPalmConcessions] WHERE location_id IN (SELECT location_id FROM [list-oilPalmConcessions] WHERE globalid IN ({GLOBAL_IDS}))'
            SET @ANALYSIS_SQL = REPLACE(@ANALYSIS_SQL, '{GLOBAL_IDS}', @global_ids)
            EXEC sp_executesql @ANALYSIS_SQL
        END
GO

CREATE PROCEDURE dbo.uspGetAdministrativeAreasGlobalId
	@global_ids NVARCHAR(MAX) = NULL
AS
	IF @global_ids IS NULL OR @global_ids = ''
		BEGIN
			SELECT 1 AS [list_id],[Location Name],[Country],[State],[Sub State],[gadmid],[Latitude],[Longitude],[Location Classification],[Size],[location_id] FROM [list-administrativeAreas]
			SELECT * FROM [analysis-administrativeAreas]
		END
	ELSE
		DECLARE @LIST_SQL NVARCHAR(MAX)
		SET @LIST_SQL = 'SELECT 1 AS [list_id],[Location Name],[Country],[State],[Sub State],[gadmid],[Latitude],[Longitude],[Location Classification],[Size],[location_id] FROM [list-administrativeAreas] WHERE gadmid IN ({GADMIDS})'
		SET @LIST_SQL = REPLACE(@LIST_SQL, '{GADMIDS}', @global_ids)
		EXEC sp_executesql @LIST_SQL
		DECLARE @ANALYSIS_SQL NVARCHAR(MAX)
		SET @ANALYSIS_SQL = 'SELECT * FROM [analysis-administrativeAreas] WHERE location_id IN (SELECT location_id FROM [list-administrativeAreas] WHERE gadmid IN ({GADMIDS}))'
		SET @ANALYSIS_SQL = REPLACE(@ANALYSIS_SQL, '{GADMIDS}', @global_ids)
		EXEC sp_executesql @ANALYSIS_SQL
GO

CREATE PROCEDURE dbo.uspRSPOOilPalmConcessionsGlobalId
    @global_ids NVARCHAR(MAX) = NULL
AS
    IF @global_ids IS NULL OR @global_ids = ''
        BEGIN
            SELECT 5 AS [list_id],[Location Name],Company,[Parent Company],Certification,Latitude,Longitude,[Location Classification],Commodity,Country,State,[Sub State],[gadmid],globalid,location_id,[Analysis Area] FROM [gfwpro].[dbo].[list-rspoOilPalmConcessions]
            SELECT * FROM [gfwpro].[dbo].[analysis-rspoOilPalmConcessions]
        END
    ELSE
        BEGIN
            DECLARE @LIST_SQL NVARCHAR(MAX)
            SET @LIST_SQL = 'SELECT 5 AS [list_id],[Location Name],Company,[Parent Company],Certification,Latitude,Longitude,[Location Classification],Commodity,Country,State,[Sub State],[gadmid],globalid,location_id,[Analysis Area] FROM [gfwpro].[dbo].[list-rspoOilPalmConcessions] WHERE globalid IN ({GLOBAL_IDS})'
            SET @LIST_SQL = REPLACE(@LIST_SQL, '{GLOBAL_IDS}', @global_ids)
            EXEC sp_executesql @LIST_SQL

            DECLARE @ANALYSIS_SQL NVARCHAR(MAX)
            SET @ANALYSIS_SQL = 'SELECT * FROM [analysis-rspoOilPalmConcessions] WHERE location_id IN (SELECT location_id FROM [list-rspoOilPalmConcessions] WHERE globalid IN ({GLOBAL_IDS}))'
            SET @ANALYSIS_SQL = REPLACE(@ANALYSIS_SQL, '{GLOBAL_IDS}', @global_ids)
            EXEC sp_executesql @ANALYSIS_SQL
        END
GO


CREATE PROCEDURE dbo.uspGetGFWListLocationAnalysis
    @list_id INT,
    @location_ids NVARCHAR(MAX) = NULL
AS
    DECLARE @table NVARCHAR(150)
    SET @table = (SELECT list_analysis_table_name FROM GFWLists WHERE id = @list_id)

    IF @location_ids IS NULL OR @location_ids = ''
        BEGIN
            DECLARE @SQL NVARCHAR(MAX)
            SET @SQL = 'SELECT {LIST_ID} AS list_id, * FROM [{ANALYSIS_TABLE}]'
            SET @SQL = REPLACE(@SQL, '{LIST_ID}', @list_id)
            SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @table)
            EXEC sp_executesql @SQL
        END
    ELSE
        BEGIN
            DECLARE @SQL2 NVARCHAR(MAX)
            SET @SQL2 = 'SELECT {LIST_ID} AS list_id, * FROM [{ANALYSIS_TABLE}] WHERE location_id IN ({LOCATION_IDS})'
            SET @SQL2 = REPLACE(@SQL2, '{LIST_ID}', @list_id)
            SET @SQL2 = REPLACE(@SQL2, '{ANALYSIS_TABLE}', @table)
            SET @SQL2 = REPLACE(@SQL2, '{LOCATION_IDS}', @location_ids)
            EXEC sp_executesql @SQL2
        END
GO


DROP PROCEDURE IF EXISTS [dbo].[uspGetAnalysisDataCountForUserList];

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[uspGetAnalysisDataCountForUserList]
	@listID INT
AS
	DECLARE @listLocationTableName NVARCHAR(1000)
	SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID

	SELECT SUM (row_count) AS TotalRows FROM sys.dm_db_partition_stats

	WHERE object_id=OBJECT_ID(@listLocationTableName)   

	AND (index_id=0 or index_id=1);

GO

DROP PROCEDURE IF EXISTS [dbo].[uspGetPaginatedAnalysisDataForUserList];

GO

CREATE PROCEDURE [dbo].[uspGetPaginatedAnalysisDataForUserList]
  @listID INT,
  @PageNumber AS INT,
  @RowsOfPage AS INT,
  @OrderByColumn AS NVARCHAR(MAX) = '[Location Name]', -- [Investment Name]
  @Order AS NVARCHAR(5) = 'ASC',
  @SubState AS NVARCHAR(150) = null,
  @Country AS NVARCHAR(150) = null,
  @State AS NVARCHAR(150) = null,
  @AnalysisAreaFilter AS float = null,
  @AnalysisAreaOperator AS VARCHAR(10)='>',
  @Geometry AS BIT = 0
AS
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @listAnalysisTableName NVARCHAR(1000)
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @template_id INT
DECLARE @SQL NVARCHAR(MAX)
DECLARE @Filters NVARCHAR(MAX) = ''

SET NOCOUNT ON
-- Obtain the location table name and the analysis table name for the list.
-- Obtain the location table name and the analysis table name for the list.
SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name, @template_id = template_id FROM Lists WHERE id = @listID

IF @OrderByColumn != '[Location Name]' -- if not default column
BEGIN
  IF COL_LENGTH(@listLocationTableName, REPLACE(REPLACE(@OrderByColumn,'[',''),']','')) IS NULL -- If column doesnt exists, order by new one default column
  BEGIN
    IF COL_LENGTH(@listLocationTableName,'Location Name') IS NULL
    BEGIN
      SET @OrderByColumn = '[Investment Name]'
    END
    ELSE
    BEGIN
      SET @OrderByColumn = '[Location Name]'
    END
  END
  ELSE
  BEGIN
    SET @OrderByColumn = '['+@OrderByColumn+']' -- add brackets to avoid break SQL Procedure
  END
END
ELSE
BEGIN
  IF COL_LENGTH(@listLocationTableName,'Location Name') IS NULL
  BEGIN
    SET @OrderByColumn = '[Investment Name]'
  END
  ELSE
  BEGIN
    SET @OrderByColumn = '[Location Name]'
  END
END
-- Default column location name is not found


-- Obtain the needed columns from the List Location Table. (All but Geometry)
SELECT @listLocationTableCols = STUFF(
  (
    SELECT '], L.[' + [name] FROM sys.columns
    WHERE
      [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
      AND [name] NOT IN ('Geometry', 'location_id')
      FOR XML PATH('')
  ),1,3,'') + ']';

SET @SQL = N';WITH MyListTable AS (SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS}, location_id as list_location_id'      
IF @Geometry = 1
BEGIN
  SET @SQL = @SQL + ', Geometry.ToString() As [WKTGeometry]'
END     

SET @SQL = @SQL + ' FROM [{LOCATION_TABLE}] L), ';
DECLARE @listAnalysisTableCols NVARCHAR(MAX)

-- Obtain the needed columns from the List Analysis Table. (All but List ID)
SELECT @listAnalysisTableCols = STUFF(
  (
    SELECT '], A.[' + [name] FROM sys.columns
    WHERE
      [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listAnalysisTableName)
      AND [name] NOT IN ('id')
      FOR XML PATH('')
  ),1,3,'') + ']';

-- ADD Filters
IF @Country IS NOT NULL 
  SET @Filters = + @Filters + ' AND Country = @Country'

IF @State IS NOT NULL 
  SET @Filters = + @Filters + ' AND State = @State'

IF @SubState IS NOT NULL 
  SET @Filters = + @Filters + ' AND [Sub State] = @SubState'

IF ISNUMERIC( @AnalysisAreaFilter ) = 1
BEGIN
  PRINT 'Filter'
  PRINT @AnalysisAreaFilter
  print 'test-' + Convert(varchar(50), @AnalysisAreaFilter);
  IF @AnalysisAreaOperator NOT IN('>=', '<=', '<', '>')
    RAISERROR ('Invalid @AnalysisAreaOperator', -1, 1); 
  SET @Filters = + @Filters + ' AND [Analysis Area] ' + @AnalysisAreaOperator + ' @AnalysisAreaFilter '
END
-- END Filters

-- Return data from both tables
SET @SQL = @SQL + ' MyAnalysisTable AS(SELECT {LIST_ID} As analysis_list_id, {TEMPLATE_ID} As template_id, {ANALYSIS_COLUMNS} FROM [{ANALYSIS_TABLE}] A) 
          SELECT * FROM MyListTable INNER JOIN MyAnalysisTable ON MyListTable.list_id = MyAnalysisTable.analysis_list_id AND  MyListTable.list_location_id = MyAnalysisTable.location_id 
          WHERE 1=1 '+@Filters+'
          ORDER BY '+@OrderByColumn + ' '+@Order+' OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY';
PRINT @Filters  
-- MyListTable.[Location Name]

SET @SQL = REPLACE(@SQL, '{TEMPLATE_ID}', @template_id);
SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
SET @SQL = REPLACE(@SQL, '{LOCATION_COLUMNS}', @listLocationTableCols);
SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);
SET @SQL = REPLACE(@SQL, '{ANALYSIS_COLUMNS}', @listAnalysisTableCols);
SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @listAnalysisTableName);

print @SQL
EXEC sp_executesql @SQL, 
          N'@PageNumber INT, @RowsOfPage INT, @OrderByColumn AS NVARCHAR(MAX), @Order AS NVARCHAR(5), @Country AS NVARCHAR(150), @State AS NVARCHAR(150), @SubState AS NVARCHAR(150), @AnalysisAreaFilter AS float, @AnalysisAreaOperator AS VARCHAR(10)',
          @PageNumber=@PageNumber, @RowsOfPage=@RowsOfPage, @OrderByColumn=@OrderByColumn, @Order=@Order, @Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaFilter=@AnalysisAreaFilter, @AnalysisAreaOperator=@AnalysisAreaOperator;

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[uspGetVerifiedUserRouteInfo]
	@userEmail NVARCHAR(50)
AS
	-- Get Results for all users that are not inactive.
	SELECT UR.user_email, US.user_secret, UR.organization_id, UR.organization_user_id,
	UR.organization_user_status_id, OG.organization_name, OG.organization_db, OG.organization_status_id, OG.subscription_status_id
	FROM UserRoutes UR LEFT JOIN UserSecrets US ON UR.user_email = US.user_email
	LEFT JOIN Organizations OG ON UR.organization_id = OG.id
	WHERE UR.user_email = @userEmail AND UR.organization_user_status_id <> 3