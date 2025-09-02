/** (no parameters) */
export const getAccountInformation = `
SELECT * FROM AccountProfile LEFT JOIN Users on Users.id = AccountProfile.manager_user_id
`;
