/** ******************************************************************
*   @name: s3.utils.js
*   @description : A utility file to allow calling various
* functionality from AWS SDK relating to S3
*
*   @function {get}
*   @function {put}
*   @function {del}

********************************************************************/
const AWS = require('aws-sdk');
const config = require('../config');

const s3 = new AWS.S3();

function get(bucket, key) {
  return new Promise((resolve, reject) => {
    const parameters = {
      Bucket: bucket,
      Key: key,
    };
    s3.getObject(parameters, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(JSON.parse(data.Body.toString()));
      }
    });
  });
}

function put(objectName, object) {
  return new Promise((resolve, reject) => {
    const filePath = `${process.env.NODE_ENV}/${objectName}.geojson`;
    const parameters = {
      Bucket: config.AWSVars.s3.analysisBucket,
      Key: filePath,
      Body: JSON.stringify(object),
      ContentType: 'application/json',
    };
    s3.putObject(parameters, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve({
          bucket: config.AWSVars.s3.analysisBucket,
          key: filePath,
        });
      }
    });
  });
}

function del(bucket, key) {
  return new Promise((resolve, reject) => {
    const parameters = {
      Bucket: bucket,
      Key: key,
    };
    s3.deleteObject(parameters, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  get,
  put,
  del,
};
