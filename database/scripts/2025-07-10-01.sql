/*========================================================================================
  GPV-3805: Add [has_customer_access] column to [GFWProRootUserRoutes]
========================================================================================*/

/**
  Applies to environment: DEV, QA, STAGING
  - Adds a NOT NULL BIT column with default TRUE
*/

-- For non-production environments
USE [gfwpro]; -- uncomment if necessary

ALTER TABLE [dbo].[GFWProRootUserRoutes]
ADD [has_customer_access] BIT NOT NULL 
    CONSTRAINT [DF_GFWProRootUserRoutes_has_customer_access] DEFAULT ((1));
GO

/**
  Applies to environment: PROD
  - Adds a NOT NULL BIT column with default FALSE
*/

-- For production environment only
USE [gfwpro]; -- uncomment if necessary

ALTER TABLE [dbo].[GFWProRootUserRoutes]
ADD [has_customer_access] BIT NOT NULL 
    CONSTRAINT [DF_GFWProRootUserRoutes_has_customer_access] DEFAULT ((0));
GO
