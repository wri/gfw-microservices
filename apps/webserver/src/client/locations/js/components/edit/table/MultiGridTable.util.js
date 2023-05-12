export const _getFeatures = (features, showValidated) => {
  return features.filter((feature) => !_checkIfRowHaveError(showValidated, feature));
};

const _checkIfRowHaveError = (showValidated, feature) =>
  (showValidated === 'valid' && feature.valid === false) || (showValidated === 'invalid' && feature.valid === true);

/**
 * Adding `location_id` property for each feature of List
 * @param features
 * @returns {*}
 */
export const prepUploadFeatures_AddLocationID = (features) => {
  return features.map((feature, index) => {
    feature.location_id = index;
    return feature;
  });
};
