export const getPolicyList = `
-- note: calling sites of this query did not use orgID
SELECT document_name
FROM Policies
`;
