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

export const getListOfCountries = () => {
  return fetch('/map/gadm-admininstrative-boundaries', {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then(({ data }) => {
      return {
        countryOptions: data,
      };
    });
};
export const getListOfStatesOrProvinces = (countryCode) => {
  return fetch(`/map/gadm-admininstrative-boundaries?countryCode=${countryCode}`, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then(({ data }) => {
      return {
        stateOrProvinceOptions: data,
      };
    });
};
