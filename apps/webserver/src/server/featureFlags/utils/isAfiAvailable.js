const isAfiAvailable = (organizationId) =>
  process.env.NODE_ENV !== 'production' || process.env.NODE_ENV !== 'staging' ||
  JSON.parse(process.env?.ORGS_WITH_AFI_FEATURE_AVAILABLE || null)?.includes(organizationId);

module.exports = {
  isAfiAvailable,
};
