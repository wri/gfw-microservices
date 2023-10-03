const isLowerEnvironment = () =>
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa';

const isAfiAvailable = (organizationId) =>
  isLowerEnvironment() ||
  JSON.parse(process.env?.ORGS_WITH_AFI_FEATURE_AVAILABLE || null)?.includes(organizationId);

const isArgentinaAvailable = (organizationId) =>
  isLowerEnvironment() ||
  JSON.parse(process.env?.ORGS_WITH_ARGENTINA_FEATURE_AVAILABLE || null)?.includes(organizationId);

module.exports = {
  isAfiAvailable,
  isArgentinaAvailable,
};
