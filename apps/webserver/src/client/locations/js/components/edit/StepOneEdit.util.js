import _omit from 'lodash/omit';

export const STEP_ONE_EDIT_EXCLUDED_ATTRIBUTES = ['Accuracy Rating of Location Entered'];

/**
 * Handle Step One Edit Features
 * @param {Object} selectedLocationData - Features
 * @return {*} - Processed features
 */
export function handleStepOneEditFeatures(selectedLocationData) {
  return selectedLocationData.map((feature) => {
    return _omit(feature, STEP_ONE_EDIT_EXCLUDED_ATTRIBUTES);
  });
}
