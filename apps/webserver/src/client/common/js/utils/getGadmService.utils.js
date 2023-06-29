import { PRODUCTION_ENVIRONMENTS } from '../../../../config/config/environments.config';
import { GADM_SERVICE__PROD, GADM_SERVICE__STAGING } from '../config';

/**
 * @description Returns the correct GADM service based on the environment
 *
 * @return {string} - The correct GADM service URL
 */
export const getGadmService = () => {
  return PRODUCTION_ENVIRONMENTS.includes(window.CURRENT_ENVIRONMENT)
    ? GADM_SERVICE__PROD
    : GADM_SERVICE__STAGING;
};
