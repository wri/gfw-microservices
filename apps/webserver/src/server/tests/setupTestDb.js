const sqlUtils = require('../../config/privateutils/sql.utils');

// SQL commands to create the tables in systemDB (copied from gfw-microservices/database/gfwpro/schema/...)
const systemTableCreates = [
  `CREATE TABLE [dbo].[UserRoutes](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [user_email] [nvarchar](50) NOT NULL,
    [organization_id] [int] NOT NULL,
    [organization_user_id] [int] NOT NULL,
    [organization_user_status_id] [int] NOT NULL,
    CONSTRAINT [PK_UserRoutes] PRIMARY KEY CLUSTERED
  (
    [id] ASC
  ))`,
  `CREATE TABLE [dbo].[UserSecrets](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [user_email] [nvarchar](50) NOT NULL,
    [user_secret] [varchar](64) NOT NULL,
    [user_auth_preference_id] [int] NOT NULL,
    CONSTRAINT [PK_UserSecrets] PRIMARY KEY CLUSTERED
  (
    [id] ASC
  ))`,
  `CREATE TABLE [dbo].[Organizations](
    [id] [int] NOT NULL,
    [organization_name] [nvarchar](200) NULL,
    [organization_db] [nvarchar](200) NULL,
    [organization_status_id] [int] NOT NULL,
    [organization_activated_time] [smalldatetime] NULL,
    [subscription_status_id] [smallint] NOT NULL,
   CONSTRAINT [PK_Organizations] PRIMARY KEY CLUSTERED
  (
    [id] ASC
  ))`,
];

// SQL commands to create the tables in org/client DB (copied from gfw-microservices/database/clientstore/schema/...)
const orgTableCreates = [
  `CREATE TABLE [dbo].[UserCommodities](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [user_id] [int] NOT NULL,
    [commodity_id] [int] NOT NULL,
   CONSTRAINT [PK_UserCommodities] PRIMARY KEY CLUSTERED
  (
    [id] ASC
  ))`,
  `CREATE TABLE [dbo].[UserGeographies](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [user_id] [int] NOT NULL,
    [geography_id] [int] NOT NULL,
   CONSTRAINT [PK_UserGeographies] PRIMARY KEY CLUSTERED
  (
    [id] ASC
  ))`,
  `CREATE TABLE [dbo].[Users](
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
   CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED
  (
    [id] ASC
  )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
   CONSTRAINT [UQ_UserEmail] UNIQUE NONCLUSTERED
  (
    [email] ASC
  )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
  )`,
];

// convert above table creation commands above from mssql to sqlite
const mssql2sqliteForCreate = (mssqlQuery) => {
  return mssqlQuery
    .replace('[dbo].', '')
    .replace('CLUSTERED', '')
    .replace('NONCLUSTERED', '')
    .replaceAll(/WITH \([^)]+\)/g, '')
    .replaceAll('ON [PRIMARY]', '')
    .replaceAll('\n', '');
};

// SQL commands to insert minimal test data in the tables
const insertTestData = [
  // system tables first
  `INSERT INTO UserRoutes (id, user_email, organization_id, organization_user_id, organization_user_status_id) VALUES
    (1, 'dt_user0@jestco.co', 1, 123, 2)`,
  `INSERT INTO UserSecrets (id, user_email, user_secret, user_auth_preference_id) VALUES
    (1, 'dt_user0@jestco.co', 'secret', 0)`,
  `INSERT INTO Organizations (id, organization_name, organization_db, organization_status_id, organization_activated_time, subscription_status_id) VALUES
    (1, 'JestCo', 'clientstore_JestCo', 2, '2023-01-01T01:01:01', 2)`,
  // org tables below
  `INSERT INTO UserCommodities (id, user_id, commodity_id) VALUES
    (1, 123, 0)`,
  `INSERT INTO UserGeographies (id, user_id, geography_id) VALUES
    (1, 123, 0)`,
  `INSERT INTO Users (id, first_name, middle_initial, last_name, email, phone, title_id, access_level_id, status_id, activated_time, email_subscription, is_system_user, viirs_email_frequency, glad_email_frequency, forma_email_frequency, terrai_email_frequency, gran_chaco_email_frequency) VALUES
    (123, 'JestF', 'M', 'JestL', 'dt_user0@jestco.co', '12345', 1, 1, 2, '2023-01-01T01:01:01', 0, 0, 0, 0, 0, 0, 0)`,
];

const initDb = async () => {
  // fails doing this in parallel, so must be done sequentially
  // create all the tables
  for (let index = 0; index < systemTableCreates.length; index += 1) {
    const sqliteQuery = mssql2sqliteForCreate(systemTableCreates[index]);
    // eslint-disable-next-line no-await-in-loop
    await sqlUtils.executeSystemQuery(sqliteQuery);
  }
  for (let index = 0; index < orgTableCreates.length; index += 1) {
    const sqliteQuery = mssql2sqliteForCreate(orgTableCreates[index]);
    // eslint-disable-next-line no-await-in-loop
    await sqlUtils.executeSystemQuery(sqliteQuery);
  }
  // insert test data
  for (let index = 0; index < insertTestData.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await sqlUtils.executeSystemQuery(insertTestData[index]);
  }
};

module.exports = {
  initDb,
};
