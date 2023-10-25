import { executeQueryJSON } from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';

exports.esriQuery = (url = '', queryProperties = {}) => {
  const query = new Query(queryProperties);
  return executeQueryJSON(url, query);
};
