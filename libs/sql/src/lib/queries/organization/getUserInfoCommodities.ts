/**
 * @userID INT
 */
export const getUserInfoCommodities = `
SELECT commodity_id FROM UserCommodities WHERE user_id = @userID
`;
