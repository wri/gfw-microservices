const tmp = require('tmp');
const _ = require('lodash');

import { convertObjectToAWSPattern } from './utils';

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

const buildSQSMessage = ({ request, file }) => {
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
    isGFWList,
  } = request.query;

  const tmpPath = tmp.tmpNameSync();
  const fileName = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

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
    list: JSON.stringify({ listId, listFilterStr, listView, selectedLocations, isGFWList }),
  };
  const filtersClean = _.pickBy(filters, _.identity);

  if (!Object.prototype.hasOwnProperty.call(filtersClean, 'type')) {
    filtersClean.type = 'input';
  }

  return convertObjectToAWSPattern({ fileName, filters, messageTemplate: messageSQSTemplate });
};

export default buildSQSMessage;
