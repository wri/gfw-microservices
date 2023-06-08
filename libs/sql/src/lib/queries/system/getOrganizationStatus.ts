const getOrganizationStatus =
  'SELECT organization_status_id, subscription_status_id FROM Organizations WHERE id = @organizationId';

export { getOrganizationStatus };
