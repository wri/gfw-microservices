const isAfiAvailable = (organizationId) =>
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'qa' ||
  JSON.parse(process.env?.ORGS_WITH_AFI_FEATURE_AVAILABLE || null)?.includes(organizationId);

module.exports = {
  isAfiAvailable,
};
