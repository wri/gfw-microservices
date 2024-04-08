/**
 * @summary updates the renewal time column for org Pending to Active
 * @param {Int} PendingAccountID
 * @param {DateTime} RenewalTime
 */
export const setOrganizationRenewalTime = `
UPDATE Organizations
SET renewal_time = @RenewalTime
WHERE id = @PendingAccountID;
`;
