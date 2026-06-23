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
/****** Object:  StoredProcedure [dbo].[uspGetPendingAccountInformation]    Script Date: 4/4/2023 7:48:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[uspGetPendingAccountInformation]
	@pendingaccount_id INT
AS
	SELECT PendingAccounts.organization_name,
		PendingAccounts.organization_is_subsidiary,
		PendingAccounts.organization_parent,
		PendingAccounts.organization_website,
		PendingAccounts.organization_address,
		PendingAccounts.organization_country,
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
