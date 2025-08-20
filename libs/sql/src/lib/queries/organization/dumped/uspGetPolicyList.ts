/**
 * @orgID INT = 0
 */
export const getPolicyList = `
IF (@orgID > 0)
									BEGIN
										SELECT @orgID AS organization_id, document_name
										FROM AccountProfile
										CROSS JOIN Policies
									END
								ELSE
									BEGIN
										SELECT document_name
										FROM Policies
									END
`;
