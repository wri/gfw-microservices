const tmp = require('tmp');
const _ = require('lodash');

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
    source,
  } = request.query;

  const tmpPath = tmp.tmpNameSync();
  const fileName = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

  const filters = {
    analysisAreaMax,
    analysisAreaMin,
    country,
    state,
    subState,
    userEmail,
    organizationDatabase,
    aggregate,
    type,
    key: fileName,
    file,
    combinedColumns,
    order,
    sortByAttribute: sortByAttribute?.replaceAll('"', ''),
    listId,
    listFilterStr,
    listView,
    selectedLocations,
    isGFWList,
    source,
  };
  const filtersClean = _.pickBy(filters, _.identity);

  if (!Object.prototype.hasOwnProperty.call(filtersClean, 'type')) {
    filtersClean.type = 'input';
  }

  return filters;
};

export default buildSQSMessage;
