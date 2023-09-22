const isAfiAvailable = (organizationId) =>
  process.env.NODE_ENV !== 'production' ||
  JSON.parse(process.env?.ORGS_WITH_AFI_FEATURE_AVAILABLE.includes(organizationId) || null);

module.exports = {
  isAfiAvailable,
};
