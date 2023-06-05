import { PRODUCTION_ENVIRONMENTS } from '../../../../config/config/environments.config';
import { GADM_SERVICE__PROD, GADM_SERVICE__STAGING } from '../config';

/**
 * @description Returns the correct GADM service based on the environment
 *
 * @return {string} - The correct GADM service URL
 */
export const getGadmService = () => {
  const gadmService =
    window.CURRENT_ENVIRONMENT && window.CURRENT_ENVIRONMENT.includes(PRODUCTION_ENVIRONMENTS)
      ? GADM_SERVICE__PROD
      : GADM_SERVICE__STAGING;

  return gadmService;
};
