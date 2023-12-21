/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable import/no-dynamic-require */

const path = require('path');
const sql = require('mssql');
const tmp = require('tmp');
const AWS = require('aws-sdk');

const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const sqsUtils = require(path.resolve('./config/privateutils/sqs.utils'));

const _ = require('lodash');

/**
 * @description - function that uses a procedure to return the values to populate
 * the filters of specific list.
 * */
const addCountry = (item, listRecord) => {
  const localListRecord = { ...listRecord };
  if (!Object.prototype.hasOwnProperty.call(localListRecord, item.Country)) {
    localListRecord[item.Country] = {};
  }
  return localListRecord;
};

const addState = (item, listRecord) => {
  const localListRecord = { ...listRecord };
  if (!Object.prototype.hasOwnProperty.call(listRecord[item.Country], item.State)) {
    localListRecord[item.Country][item.State] = [];
  }
  return localListRecord;
};

// TODO: check if exists other callsites, otherwise this is deprecated
const getListDataFilterValues = (request, listID) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];
    sqlUtils
      .executeOrganizationStoredProcedure(request, 'uspGetAdminAreas', parameters)
      .then((recordsets) => {
        let listRecord = {};
        for (let i = 0; i < recordsets.length; i += 1) {
          const item = recordsets[i];
          listRecord = addCountry(item, listRecord);
          listRecord = addState(item, listRecord);
          listRecord[item.Country][item.State].push(item['Sub State']);
        }
        resolve(listRecord);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          request,
          errorUtils.errorCodes.failedToGetList,
          `Failed to build fiter data for list location for List ${listID}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * @summary this function is an extraction of the getListDataFilterValues for formatting filter countries
 * @param {Array} listLocations array of locations with fields [Country, State, 'Sub State']
 * @returns {Array} array of locations of [Country, [State, [SubState]]]
 */
const formatListLocationDataForFilter = (listLocations) => {
  let listRecord = {};
  for (let i = 0; i < listLocations.length; i += 1) {
    const item = listLocations[i];
    listRecord = addCountry(item, listRecord);
    listRecord = addState(item, listRecord);
    listRecord[item.Country][item.State].push(item['Sub State']);
  }
  return listRecord;
};

/**
 * @function buildCsvFile
 * @function buildShapefile
 * @summary send message to sqs to  start background task to generate data file.
 * @name exports.buildCsvFile
 * @name exports.buildShapefile
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
const messageSQSTemplate = {
  analysisArea: {
    DataType: 'String',
    StringValue: '',
  },
  geoInfo: {
    DataType: 'String',
    StringValue: '',
  },
  userEmail: {
    DataType: 'String',
    StringValue: '',
  },
  organizationDatabase: {
    DataType: 'String',
    StringValue: '',
  },
  file: {
    DataType: 'String',
    StringValue: '',
  },
  key: {
    DataType: 'String',
    StringValue: '',
  },
  list: {
    DataType: 'String',
    StringValue: '',
  },
};

const buildSQSMessage = (request, file) => {
  const { id: listId } = request.params;
  const { user_email: userEmail, organization_database: organizationDatabase } = request.session;

  const {
    analysisAreaMax,
    analysisAreaMin,
    combinedColumns,
    country,
    listFilterStr,
    order,
    selectedLocations,
    sortByAttribute,
    state,
    subState,
    type,
    listView,
    aggregate,
  } = request.query;

  const tmpobj = tmp.fileSync();
  const fileName = tmpobj.name.replace('/tmp/', '');

  const filters = {
    analysisArea: JSON.stringify({ analysisAreaMax, analysisAreaMin }),
    geoInfo: JSON.stringify({ country, state, subState }),
    userEmail,
    organizationDatabase,
    file: JSON.stringify({
      aggregate,
      type,
      key: fileName,
      file,
      combinedColumns,
      order,
      sortByAttribute: sortByAttribute?.replaceAll('"', ''),
    }),
    list: JSON.stringify({ listId, listFilterStr, listView, selectedLocations }),
  };
  const filtersClean = _.pickBy(filters, _.identity);

  if (!Object.prototype.hasOwnProperty.call(filtersClean, 'type')) {
    filtersClean.type = 'input';
  }

  const messageSQS = Object.keys(filtersClean)
    .filter((key) => Object.keys(messageSQSTemplate).includes(key))
    .reduce((obj, key) => {
      obj[key] = { ...messageSQSTemplate[key], StringValue: filtersClean[key] };
      return obj;
    }, {});

  const sqsOrderData = {
    MessageAttributes: messageSQS,
    MessageBody: JSON.stringify(messageSQS),
    MessageDeduplicationId: sqsUtils.uniqueIdGenerator(),
    MessageGroupId: sqsUtils.uniqueIdGenerator(),
    QueueUrl: process.env.AWS_TMP_QUEUE,
  };

  return {
    message: sqsOrderData,
    key: fileName,
  };
};

const sendMessageToQueue = async (request, file) => {
  const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  };
  AWS.config.update(awsConfig);
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

  const { message, key } = buildSQSMessage(request, file);

  const sendSqsMessage = await sqs.sendMessage(message).promise();
  sendSqsMessage.key = key;
  return sendSqsMessage;
};

const mapCommodityRiskValuesToDatabaseValues = (arr) => {
  const map = {
    low: 0,
    medium: 1,
    high: 2,
  };
  return arr?.map((item) => map[item]);
};

module.exports = {
  sendMessageToQueue,
  buildSQSMessage,
  getListDataFilterValues,
  formatListLocationDataForFilter,
  mapCommodityRiskValuesToDatabaseValues,
};
