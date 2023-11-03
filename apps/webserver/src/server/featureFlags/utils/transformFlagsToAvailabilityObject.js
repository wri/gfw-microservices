const { camelCase } = require('lodash');

module.exports = function transformFlagsToAvailabilityObject(featureFlags = []) {
  const availabilityObject = {};

  for (const flag of featureFlags) {
    const key = camelCase(`is${flag.flagId}Available`);
    availabilityObject[key] = flag.flagState;
  }

  return availabilityObject;
};
