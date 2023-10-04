/** ******************************************************************
 *   @name : load-env.js
 *   @description : Module to download environment variables from
 *                  an S3 bucket.
 *
 *   @function {loadEnvironmentVars}
 *
 ********************************************************************/
// Import neccesary modules.
const AWS = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

//Setup S3 Constants.
const s3 = new AWS.S3();
const ENV_BUCKET = 'gfwpro-env';

/** @function {loadEnvironmentVars}
 *   @summary Loads the enviroment variables from an S3 location.
 *   @param {Object} nodeEnvironment - String specifying the NODE_ENV parameter.
 *   @return {Object} returns a promise that resolves successfully if
 *                    environment variables get loaded.
 */
const loadEnvironmentVars = (nodeEnvironment) => {
  const promise = new Promise((resolve, reject) => {
    try {
      //If environment is development, environment variables
      //are already loaded from local docker-compose file.
      console.log('ENV:', nodeEnvironment);
      if (!nodeEnvironment || nodeEnvironment === 'development' || nodeEnvironment === 'test') {
        resolve(true);
      } else {
        // QA, Staging and Production/ProdV2 environments load config info from S3.
        getDataFromS3(nodeEnvironment)
          .then((envInfo) => {
            const config = dotenv.parse(envInfo); // will return an object
            for (let k in config) {
              process.env[k] = config[k];
            }
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          });
      }
    } catch (e) {
      reject(e);
    }
  });

  return promise;
};

/** @function {getDataFromS3}
 *   @summary Downloads the envirnment variables from an S3 location.
 *   @param {Object} node_environment - String specifying the NODE_ENV parameter.
 *   @return {Object} returns a promise that resolves successfully if
 *                    environment variables get downloaded.
 */
const getDataFromS3 = (node_environment) => {
  const promise = new Promise((resolve, reject) => {
    try {
      //Download file containing data.
      const params = {
        Bucket: `${ENV_BUCKET}`,
        Key: `${node_environment}.env`,
      };

      s3.getObject(params, async function (err, data) {
        if (err) {
          console.log(err, err.stack);
          reject(err);
        } else {
          const s3Data = await data.Body.transformToString();
          resolve(s3Data);
        }
      });
    } catch (e) {}
  });

  return promise;
};

module.exports = {
  loadEnvironmentVars,
};
