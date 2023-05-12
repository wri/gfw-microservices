USE gfwpro

-- Declare Important Variables.
DECLARE @latestOrgID INT
DECLARE @latestUserID INT
DECLARE @currentDate SMALLDATETIME

-- Set Current Date.
SET @currentDate = GetDate()

--Delete accounts not in Staging DB.
DELETE FROM UserSecrets WHERE user_email = 'brapptesters@gmail.com';
DELETE FROM UserSecrets WHERE user_email = 'prosupertester2@gmail.com';

--Delete account from Pro Admin
DELETE FROM GFWProRootUserRoutes WHERE user_email = 'brapptesters@gmail.com';
DELETE FROM UserSecrets WHERE user_email = 'prosupertester2@gmail.com';

--Insert Additional User Secrets into Table for WRI Users.
INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES('Liza.Logounova@wri.org','FI3GC5CXOU2DYRBFMJTWCTKUJRBHML2QGAXUA62KFJOTSNBBGM6A', 0)
INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES('jane.lloyd@wri.org','FRJEUUCGNZ2CSWSYM4STG5SJPVEUUUCCLN3HARJTOA4G2N2GKV5A', 0)
INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES('andrew.maddocks@wri.org','O5WESYL2JRLH2VSBERUHMKCJOI6HOXKSKRTUQOSLLZGFGODLHZ', 0)
INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES('caroline.winchester@wri.org','IRZWQL2SI5JWI63WGREUGWDMNNNTAYKQFE4WEVT5MJJHS3ZMHM', 0)
INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES('anne.rosenbarger@wri.org','LVLFIPD3JRDEONSEN4RU64STIJ2DAVJQKRXGQMBRGBYDCSSNPV', 0)
INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES('ryan.sarsfield@wri.org','H53HMNRDONIEMOKUNNISIOK2NA3WKRCUGAQV25BBEQZTM7JKNR', 0)
INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES('luiz.amaral@wri.org','FESXA5K5ONGHIVDWMERW2OJQPJXXW22JERIS4ODLJRKXIQTEOR', 0)
INSERT INTO UserSecrets(user_email, user_secret, user_auth_preference_id) VALUES('ifeoma.collins@wri.org','G5NDIOJKJZDUY63HKZQT4MRGFFRDOZK2IQ3U6NTUKJWCQZJBG43A', 0)

-- Activate New Account for LIZA
EXEC uspCreateNewAccount 'LIZA', '10 G St NE #800, Washington, DC 20002', 'http://www.wri.org', 0, '';
SELECT TOP 1 @latestOrgID = id FROM PendingAccounts ORDER BY id DESC;
EXEC uspCreateNewAccountClassifications @latestOrgID, '6';
EXEC uspCreateNewAccountUser @latestOrgID, 'Liza', '', 'Logounova', 'liza.logounova@wri.org', '111-111-1111', 2, '';
SELECT @latestUserID = id FROM PendingAccountsUsers WHERE pendingaccounts_id = @latestOrgID
EXEC uspCreateNewAccountUserGeographies @latestUserID, 1;
EXEC uspCreateNewAccountUserCommodities @latestUserID, 1;
EXEC uspActivatePendingAccount @latestOrgID, 'FI3GC5CXOU2DYRBFMJTWCTKUJRBHML2QGAXUA62KFJOTSNBBGM6A', @currentDate;
EXEC uspRemovePendingOrganization @latestOrgID;

-- Activate New Account for JANE
EXEC uspCreateNewAccount 'JANE', '10 G St NE #800, Washington, DC 20002', 'http://www.wri.org', 0, '';
SELECT TOP 1 @latestOrgID = id FROM PendingAccounts ORDER BY id DESC;
EXEC uspCreateNewAccountClassifications @latestOrgID, '6';
EXEC uspCreateNewAccountUser @latestOrgID, 'Jane', '', 'Lloyd', 'jane.lloyd@wri.org', '111-111-1111', 2, '';
SELECT @latestUserID = id FROM PendingAccountsUsers WHERE pendingaccounts_id = @latestOrgID
EXEC uspCreateNewAccountUserGeographies @latestUserID, 1;
EXEC uspCreateNewAccountUserCommodities @latestUserID, 1;
EXEC uspActivatePendingAccount @latestOrgID, 'FRJEUUCGNZ2CSWSYM4STG5SJPVEUUUCCLN3HARJTOA4G2N2GKV5A', @currentDate;
EXEC uspRemovePendingOrganization @latestOrgID;

-- Activate New Account for ANDREW
EXEC uspCreateNewAccount 'ANDREW', '10 G St NE #800, Washington, DC 20002', 'http://www.wri.org', 0, '';
SELECT TOP 1 @latestOrgID = id FROM PendingAccounts ORDER BY id DESC;
EXEC uspCreateNewAccountClassifications @latestOrgID, '6';
EXEC uspCreateNewAccountUser @latestOrgID, 'Andrew', '', 'Maddocks', 'andrew.maddocks@wri.org', '111-111-1111', 2, '';
SELECT @latestUserID = id FROM PendingAccountsUsers WHERE pendingaccounts_id = @latestOrgID
EXEC uspCreateNewAccountUserGeographies @latestUserID, 1;
EXEC uspCreateNewAccountUserCommodities @latestUserID, 1;
EXEC uspActivatePendingAccount @latestOrgID, 'O5WESYL2JRLH2VSBERUHMKCJOI6HOXKSKRTUQOSLLZGFGODLHZ', @currentDate;
EXEC uspRemovePendingOrganization @latestOrgID;

-- Activate New Account for CARONLINE
EXEC uspCreateNewAccount 'CAROLINE', '10 G St NE #800, Washington, DC 20002', 'http://www.wri.org', 0, '';
SELECT TOP 1 @latestOrgID = id FROM PendingAccounts ORDER BY id DESC;
EXEC uspCreateNewAccountClassifications @latestOrgID, '6';
EXEC uspCreateNewAccountUser @latestOrgID, 'Caroline', '', 'Winchester', 'caroline.winchester@wri.org', '111-111-1111', 2, '';
SELECT @latestUserID = id FROM PendingAccountsUsers WHERE pendingaccounts_id = @latestOrgID
EXEC uspCreateNewAccountUserGeographies @latestUserID, 1;
EXEC uspCreateNewAccountUserCommodities @latestUserID, 1;
EXEC uspActivatePendingAccount @latestOrgID, 'IRZWQL2SI5JWI63WGREUGWDMNNNTAYKQFE4WEVT5MJJHS3ZMHM', @currentDate;
EXEC uspRemovePendingOrganization @latestOrgID;

-- Activate New Account for ANNE
EXEC uspCreateNewAccount 'ANNE', '10 G St NE #800, Washington, DC 20002', 'http://www.wri.org', 0, '';
SELECT TOP 1 @latestOrgID = id FROM PendingAccounts ORDER BY id DESC;
EXEC uspCreateNewAccountClassifications @latestOrgID, '6';
EXEC uspCreateNewAccountUser @latestOrgID, 'Anne', '', 'Rosenbarger', 'anne.rosenbarger@wri.org', '111-111-1111', 2, '';
SELECT @latestUserID = id FROM PendingAccountsUsers WHERE pendingaccounts_id = @latestOrgID
EXEC uspCreateNewAccountUserGeographies @latestUserID, 1;
EXEC uspCreateNewAccountUserCommodities @latestUserID, 1;
EXEC uspActivatePendingAccount @latestOrgID, 'LVLFIPD3JRDEONSEN4RU64STIJ2DAVJQKRXGQMBRGBYDCSSNPV', @currentDate;
EXEC uspRemovePendingOrganization @latestOrgID;

-- Activate New Account for RYAN
EXEC uspCreateNewAccount 'RYAN', '10 G St NE #800, Washington, DC 20002', 'http://www.wri.org', 0, '';
SELECT TOP 1 @latestOrgID = id FROM PendingAccounts ORDER BY id DESC;
EXEC uspCreateNewAccountClassifications @latestOrgID, '6';
EXEC uspCreateNewAccountUser @latestOrgID, 'Ryan', '', 'Sarsfield', 'ryan.sarsfield@wri.org', '111-111-1111', 2, '';
SELECT @latestUserID = id FROM PendingAccountsUsers WHERE pendingaccounts_id = @latestOrgID
EXEC uspCreateNewAccountUserGeographies @latestUserID, 1;
EXEC uspCreateNewAccountUserCommodities @latestUserID, 1;
EXEC uspActivatePendingAccount @latestOrgID, 'H53HMNRDONIEMOKUNNISIOK2NA3WKRCUGAQV25BBEQZTM7JKNR', @currentDate;
EXEC uspRemovePendingOrganization @latestOrgID;

-- Activate New Account for LUIZ
EXEC uspCreateNewAccount 'LUIZ', '10 G St NE #800, Washington, DC 20002', 'http://www.wri.org', 0, '';
SELECT TOP 1 @latestOrgID = id FROM PendingAccounts ORDER BY id DESC;
EXEC uspCreateNewAccountClassifications @latestOrgID, '6';
EXEC uspCreateNewAccountUser @latestOrgID, 'Luiz', '', 'Amaral', 'luiz.amaral@wri.org', '111-111-1111', 2, '';
SELECT @latestUserID = id FROM PendingAccountsUsers WHERE pendingaccounts_id = @latestOrgID
EXEC uspCreateNewAccountUserGeographies @latestUserID, 1;
EXEC uspCreateNewAccountUserCommodities @latestUserID, 1;
EXEC uspActivatePendingAccount @latestOrgID, 'FESXA5K5ONGHIVDWMERW2OJQPJXXW22JERIS4ODLJRKXIQTEOR', @currentDate;
EXEC uspRemovePendingOrganization @latestOrgID;

-- Activate New Account for IFEOMA
EXEC uspCreateNewAccount 'IFEOMA', '10 G St NE #800, Washington, DC 20002', 'http://www.wri.org', 0, '';
SELECT TOP 1 @latestOrgID = id FROM PendingAccounts ORDER BY id DESC;
EXEC uspCreateNewAccountClassifications @latestOrgID, '6';
EXEC uspCreateNewAccountUser @latestOrgID, 'Ifeoma', '', 'Collins', 'ifeoma.collins@wri.org', '111-111-1111', 2, '';
SELECT @latestUserID = id FROM PendingAccountsUsers WHERE pendingaccounts_id = @latestOrgID
EXEC uspCreateNewAccountUserGeographies @latestUserID, 1;
EXEC uspCreateNewAccountUserCommodities @latestUserID, 1;
EXEC uspActivatePendingAccount @latestOrgID, 'G5NDIOJKJZDUY63HKZQT4MRGFFRDOZK2IQ3U6NTUKJWCQZJBG43A', @currentDate;
EXEC uspRemovePendingOrganization @latestOrgID;
