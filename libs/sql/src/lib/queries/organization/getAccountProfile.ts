/**
 * @orgID INT = 0
 * @orgStatusID INT = 0
 */
export const getAccountProfile = `
-- Obtain Classifications Information for the Account.
							DECLARE @arrClassificationIds NVARCHAR(100)
							SELECT @arrClassificationIds = COALESCE(@arrClassificationIds + ',', '') + CONVERT(VARCHAR(3), classification_id)
							FROM AccountClassifications

							IF (@orgID > 0) AND (@orgStatusID > 0)
								BEGIN
									SELECT @orgID AS organization_id, organization_name, organization_address, organization_website, organization_is_subsidiary,
									organization_parent, @arrClassificationIds AS classification_ids, @orgStatusID AS organization_status_id
									FROM AccountProfile
								END
							ELSE
								BEGIN
									SELECT organization_name, organization_address, organization_website, organization_is_subsidiary,
									organization_parent, @arrClassificationIds AS classification_ids
									FROM AccountProfile
								END
`;
