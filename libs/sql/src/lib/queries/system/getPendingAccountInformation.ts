/**
 * Mirrors dbo.uspGetPendingAccountInformation behavior.
 *
 * @param pendingaccount_id INT
 */
export const getPendingAccountInformation = `
  SELECT PendingAccounts.organization_name,
         PendingAccounts.organization_is_subsidiary,
         PendingAccounts.organization_parent,
         PendingAccounts.organization_website,
         PendingAccounts.organization_address,
         PendingAccounts.organization_country,
         PendingAccountsUsers.id,
         PendingAccountsUsers.first_name,
         PendingAccountsUsers.last_name,
         PendingAccountsUsers.title_id,
         PendingAccountsUsers.other_title,
         PendingAccountsUsers.email,
         PendingAccountsUsers.phone
  FROM PendingAccountsUsers
  LEFT JOIN PendingAccounts ON PendingAccountsUsers.pendingaccounts_id = PendingAccounts.id
  WHERE pendingaccounts_id = @pendingaccount_id
`;
