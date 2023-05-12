import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';

exports.esriQuery = (url = '', queryProperties = {}) => {
  const task = new QueryTask(url);
  const query = new Query(queryProperties);
  return task.execute(query);
};
