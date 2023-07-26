export const setOrganizationSubscriptionStatus = `UPDATE Organizations 
  SET subscription_status_id = @subscriptionStatusId 
  WHERE id = @organizationId
`;
