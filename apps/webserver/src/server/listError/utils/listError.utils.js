/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const sql = require('mssql');

const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));

/** @function {getListErrorFiles}
 *   @summary Gets list name schema from db
 *   @param  {number} list_id - id of desired list
 *   @return {Promise} Returns object if successful, error otherwise
 */
const getListErrorFiles = (req, listId) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetListErrorFiles', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((err) => {
        console.log('Error getting path of error file', err);
        reject(false);
      });
  });
};
module.exports = { getListErrorFiles };
