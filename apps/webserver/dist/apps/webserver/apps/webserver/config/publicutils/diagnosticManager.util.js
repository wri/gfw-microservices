/** ******************************************************************
*   @name : diagnosticManager.utils.js
*   @description : A utility file to regarding Diagnostics
*
*   Diagnostics can be viewed as either SINGLE or MUTIPLE locations.
    this fundamentally changes the calls due to one being stored and
    the other dynamic.
*   In addition to the previous, diagnostics have different VIEW TYPES.
    The types are either FOREST CHANGE, COMMODITIES, or POLICY
*   Each VIEW TYPE has a set of sections related to the view type
    diagnostic. (Ex. FOREST CHANGE has a section of Sensitive Areas)
********************************************************************/

/** @function {getDiagnostics}
 *   @summary The overarching function to getting data for dianostics
 *   @param {Array} locations - Arrary of selected locations
 */
exports.getDiagnostics = (locations) => {
  return locations;
};

/** @function {getForestChangeDiagnostic}
 *   @summary Function to return FOREST CHANGE diagnostics
 */
exports.getForestChangeDiagnostic = () => {};

/** @function {getCommoditiesDiagnostic}
 *   @summary Function to return COMMODITIES diagnostics
 */
exports.getCommoditiesDiagnostic = () => {};

/** @function {getPolicyDiagnostic}
 *   @summary Function to return POLICY diagnostics
 */
exports.getPolicyDiagnostic = () => {};

/************************* FOREST CHANGE SECTIONS *****************************/
/** @function {getForestChangeSensitiveAreas}
 *   @summary Function to return SENSITIVE AREA for FOREST CHANGE diagnostic
 */
exports.getForestChangeSensitiveAreas = () => {};

/** @function {getForestChangeRegions}
 *   @summary Function to return REGIONS for FOREST CHANGE diagnostic
 */
exports.getForestChangeRegions = () => {};

/** @function {getForestChangePlantations}
 *   @summary Function to return PLANTATIONS for FOREST CHANGE diagnostic
 */
exports.getForestChangePlantations = () => {};

/** @function {getForestChangeCarbonEmissions}
 *   @summary Function to return CARBON EMISSIONS for FOREST CHANGE diagnostic
 */
exports.getForestChangeCarbonEmissions = () => {};

/************************* COMMODITIES SECTIONS *****************************/
/** @function {getCommoditiesTrendsDeforestation}
 *   @summary Function to return TRENDS IN DEFORESTATION for COMMODITIES (MULTIPLE) diagnostic
 */
exports.getCommoditiesTrendsDeforestation = () => {};

/** @function {getCommoditiesPalmRiskAnalysis}
 *   @summary Function to return PALM RISK ANALYSIS for COMMODITIES (MULTIPLE) diagnostic
 */
exports.getCommoditiesPalmRiskAnalysis = () => {};

/** @function {getCommoditiesMillPriority}
 *   @summary Function to return MILL PRIORITY SUMMARY for COMMODITIES (MULTIPLE) diagnostic
 */
exports.getCommoditiesMillPriority = () => {};

/************************* POLICY SECTIONS *****************************/
/** @function {getPolicyProtectedAreas}
 *   @summary Function to return PROTECTED AREAS for POLICY diagnostic
 */
exports.getPolicyProtectedAreas = () => {};

/** @function {getPolicyNaturalHabitatProxies}
 *   @summary Function to return NATURAL HABITAT PROXIES for POLICY diagnostic
 */
exports.getPolicyNaturalHabitatProxies = () => {};

/** @function {getPolicyCriticalHabitatProxies}
 *   @summary Function to return CRITICAL HABITAT PROXIES for POLICY diagnostic
 */
exports.getPolicyCriticalHabitatProxies = () => {};

/** @function {getPolicyIndigenousPeople}
 *   @summary Function to return INDIGENOUS PEOPLE for POLICY diagnostic
 */
exports.getPolicyIndigenousPeople = () => {};

/** @function {getPolicyPeat}
 *   @summary Function to return PEAT for POLICY diagnostic
 */
exports.getPolicyPeat = () => {};

/** @function {getPolicyFires}
 *   @summary Function to return FIRES for POLICY diagnostic
 */
exports.getPolicyFires = () => {};
