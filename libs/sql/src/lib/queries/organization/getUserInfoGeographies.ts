/**
 * @param userID INT
 */
export const getUserInfoGeographies = `
SELECT geography_id FROM UserGeographies WHERE user_id = @userID
`;
