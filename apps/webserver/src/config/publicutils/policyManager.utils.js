/** ******************************************************************
 *   @name: policyManager.utils.js
 *   @description : A public utility file to manage policies
 *
 *   @function {uploadPolicies}
 *   @function {uploadPendingPolicies}
 *   @function {getPolicyList}
 *   @function {getAllPolicyList}
 *   @function {getPendingPolicyList}
 *   @function {downloadPolicy}
 *   @function {deletePolicies}
 *   @function {movePolicy}
 *   @function {initialize}
 *
 ********************************************************************/
// Imports required for this module
const path = require('path');
const sql = require('mssql');
const { S3, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

import config from '../config';
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const langResources = require(path.resolve('./config/langResources'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const rollbackUtils = require(path.resolve('./config/privateutils/rollback.utils'));
const logger = require(path.resolve('./config/privateutils/logger.utils'));

const s3 = new S3();

/** @function {uploadPolicies}
 *   @summary upload company policies to S3 and DB.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Array}   policyList - array of policies to upload
 *   @param  {Array}   policyNames - array of policy names
 *   @param  {Boolean}   overwrite - true if files should be overwritten
 *   @return {Promise<any[]>} Return array of policies to ovewrite or an empty array if successful
 */
const uploadPolicies = (req, policyList, policyNames, overwrite = false) => {
  return new Promise((resolve, reject) => {
    // Stored procedure executions
    let uspAddPolicyExecuted = false;
    // List of files already existing
    const existingFiles = [];
    const promises = [];
    //Get List of policies.
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetPolicyList')
      .then((result) => {
        policyList.forEach((file, i) => {
          const filtered = result.filter((v) => v.document_name === policyNames[i]);
          if (filtered.length !== 0) {
            existingFiles.push(policyNames[i]);
          }
        });
        return;
      })
      .then(() => {
        if (existingFiles.length > 0 && !overwrite) {
          resolve(existingFiles);
        } else if (overwrite || existingFiles.length === 0) {
          // If overwrite is true OR there are no conflicting files then push the whole policyList to S3
          policyList.forEach((file, i) => {
            const buf = new Buffer(file, 'base64');
            const params = {
              Bucket: config.AWSVars.policyParams.bucket,
              Key: `${config.AWSVars.policyParams.key}/${req.session.organization_id}/${policyNames[i]}`,
              Body: buf,
            };
            const sqlParams = [
              { field: 'document_name', type: sql.NVarChar(250), value: policyNames[i] },
            ];
            promises.push(
              new Upload({
                client: s3,
                params,
              }).done(),
              sqlUtils.executeOrganizationStoredProcedure(req, 'uspAddPolicy', sqlParams)
            );
            uspAddPolicyExecuted = true;
          });
          return Promise.all(promises);
        }
      })
      .then(() => {
        resolve([]);
      })
      .catch((err) => {
        if (uspAddPolicyExecuted) {
          policyList.forEach((policy, i) => {
            rollbackUtils.deleteOrganizationTableRow(
              req,
              'Policies',
              policyNames[i],
              'document_name'
            );
          });
        }
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUploadPolicies,
          'Failed to upload policies',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {uploadPendingPolicies}
 *   @summary upload company policies to S3 and DB in PENDING
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {number}   organizationId - organization ID
 *   @param  {Array}   policyList - array of policies to upload
 *   @param  {Array}   policyNames - array of policy names
 *   @return {Promise<Boolean>} True if successful, false otherwise.
 */
const uploadPendingPolicies = (req, organizationId, policyList, policyNames) => {
  return new Promise((resolve, reject) => {
    let uspAddPendingPolicyExecuted = false;
    const promises = [];
    policyList.forEach((file, i) => {
      const buf = new Buffer(file, 'base64');
      const s3Params = {
        Bucket: config.AWSVars.policyParams.bucket,
        Key: `${config.AWSVars.policyParams.keyPending}/${organizationId}/${policyNames[i]}`,
        Body: buf,
      };
      const sqlParams = [
        { field: 'orgID', type: sql.Int, value: organizationId },
        { field: 'document_name', type: sql.NVarChar(250), value: policyNames[i] },
      ];
      promises.push(
        new Upload({
          client: s3,
          params: s3Params,
        }).done(),
        sqlUtils.executeSystemStoredProcedure(req, 'uspAddPendingPolicy', sqlParams)
      );
    });
    // Set stored procedure execution value
    uspAddPendingPolicyExecuted = true;
    Promise.all(promises)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        if (uspAddPendingPolicyExecuted) {
          rollbackUtils.deleteSystemTableRow(
            req,
            'PendingAccountPolicies',
            organizationId,
            'organization_id'
          );
        }
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUploadPendingPolicies,
          'Failed to upload pending policies',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {getPolicyList}
 *   @summary get list of policies in database
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise<any[]>} List of policies.
 */
const getPolicyList = (req) => {
  return new Promise((resolve, reject) => {
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetPolicyList')
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetPolicyList,
          'Failed to get policy list',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {getAllPolicyList}
 *   @summary get list of policies in database
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise<any[]>} List of policies.
 */
const getAllPolicyList = (req) => {
  return new Promise((resolve, reject) => {
    if (!UserManager.isProManager(req)) {
      const userMessage = langResources.getResourceString('loginFailed');
      const sysMessage = 'UserEmail: ' + req.session.user_email + ' is not a GFW Pro Root User.';
      const eo = errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotProManager,
        userMessage,
        sysMessage
      );
      reject(eo);
    }
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetAllPolicyList')
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetPolicyList,
          'Failed to get all policies',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {getPendingPolicyList}
 *   @summary get list of policies in database
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise<any[]>} List of policies.
 */
const getPendingPolicyList = (req) => {
  return new Promise((resolve, reject) => {
    //Get List of policies.
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetPendingPolicyList')
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetPendingPolicyList,
          'Failed to get pending policy list',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {downloadPolicy}
 *   @summary Download selected policy
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String} policy - name of policy to download
 *   @return {Promise} Return file stream from s3.
 */
const downloadPolicy = async (req, policy, orgID) => {
  const params = {
    Bucket: config.AWSVars.policyParams.bucket,
    Key: `${config.AWSVars.policyParams.key}/${
      req.session.organization_id ? req.session.organization_id : orgID
    }/${policy}`,
  };
  const cmd = new GetObjectCommand(params);
  const s3response = await s3.send(cmd);
  const fileStream = s3response.Body;
  if (!fileStream) {
    const userMessage = langResources.getResourceString('failedToDownloadFile');
    const sysMessage = 'CRITICAL ERROR: Failed to download policy ' + policy;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.errorCodes.failedToDownload,
      userMessage,
      sysMessage
    );
  }
  return fileStream;
};

/** @function {deletePolicies}
 *   @summary Download selected policy
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Array}   policyList - list of policies to delete
 *   @return {Promise<Boolean>} True if successful, false otherwise.
 */
const deletePolicies = (req, policyList) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    policyList.forEach((policy) => {
      // Params to delete from S3
      const s3Params = {
        Bucket: config.AWSVars.policyParams.bucket,
        Key: `${config.AWSVars.policyParams.key}/${req.session.organization_id}/${policy}`,
      };
      // Params to delete from database
      const sqlParams = [{ field: 'document_name', type: sql.NVarChar(250), value: policy }];
      // Push list of documents to delete to promise array
      promises.push(
        s3.deleteObject(s3Params),
        sqlUtils.executeOrganizationStoredProcedure(req, 'uspDeletePolicy', sqlParams)
      );
    });
    Promise.all(promises)
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.Account.AccountUpdated,
          'Policies have been removed.'
        );
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeletePolicies,
          'Failed to upload policies',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {movePolicy}
 *   @summary Download selected policy
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {number}   pendingaccount_id - pending organization ID
 *   @param  {number}   organizationId - organization ID
 *   @return {Promise<Boolean>} True if successful, false otherwise.
 */
const movePolicy = (req, pendingaccount_id, organizationId) => {
  return new Promise((resolve, reject) => {
    let policyList = [];
    // S3 Params
    const listObjParams = {
      Bucket: config.AWSVars.policyParams.bucket,
      Prefix: `${config.AWSVars.policyParams.keyPending}/${pendingaccount_id}`,
    };
    s3.listObjects(listObjParams)
      .then((result) => {
        policyList = result.Contents;
        policyList?.reverse().forEach((file) => {
          const key = file.Key.match(/([\w-\s\(\)]+\.\w+)$/)
            ? file.Key.match(/([\w-\s\(\)]+\.\w+)$/)[0]
            : '';
          const copyParams = {
            CopySource: `${config.AWSVars.policyParams.bucket}/${file.Key}`,
            Bucket: config.AWSVars.policyParams.bucket,
            Key: `${config.AWSVars.policyParams.key}/${organizationId}/${key}`,
          };
          // Move each item in the pending folder to the new organization folder
          s3.copyObject(copyParams)
            .then(() => {
              const deleteParams = {
                Bucket: config.AWSVars.policyParams.bucket,
                Key: `${file.Key}`,
              };
              // Delete items in the pending folder
              s3.deleteObject(deleteParams, (err) => {
                if (err) {
                  throw err;
                }
              });
            })
            .catch((err) => {
              throw err;
            });
        });
        return;
      })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToMovePolicies,
          'Failed to move policies',
          err
        );
        reject(errorObject);
      });
  });
};

// Exporting the functions.
module.exports = {
  uploadPolicies,
  uploadPendingPolicies,
  getPolicyList,
  getAllPolicyList,
  getPendingPolicyList,
  downloadPolicy,
  deletePolicies,
  movePolicy,
};
