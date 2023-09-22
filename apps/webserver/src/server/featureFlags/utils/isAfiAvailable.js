const isAfiAvailable = (organizationId) =>
  process.env.NODE_ENV !== 'production' ||
  process.env?.ORGS_WITH_AFI_FEATURE_AVAILABLE.includes(organizationId);

module.exports = {
  isAfiAvailable,
};
