import axios, { AxiosPromise } from 'axios';

import { GEO_TRELLIS_ANALYZE_LIST } from '../../../../config/config/locations.config';

/**
 * Submit Edits List to be Analyzed by GeoTrellis
 *
 * @param {Object} list - List info
 * @param {boolean} [reanalyze=false] - Set to true if list needs to be reanalyzed
 * @return {AxiosPromise} - Promise
 */
export const requestGeoTrellisAnalyzeList = (list, reanalyze = false) => {
  const userId = window.userInfo.id;
  const organizationID = parseInt(window.organizationId);

  const data = {
    list: list,
    user_id: userId,
    organizationID: organizationID,
    reanalyze: reanalyze,
  };

  return axios({
    method: 'post',
    url: GEO_TRELLIS_ANALYZE_LIST.route,
    data: data,
  });
};
