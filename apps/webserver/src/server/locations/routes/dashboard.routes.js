const path = require('path');
const getDashboardData = require(path.resolve('./config/publicutils/dashboard.utils'));

module.exports = (app) => {
  /**
   * @summary Get Dashboard data from DB
   */
  app.post('/dashboard/getDashboardData', (req, res) => {
    getDashboardData
      .getDashboardData(req, req.body.list_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });

  /**
   * @summary Get GFW List Dashboard data from DB
   */
  app.post('/dashboard/getGFWListDashboardData', (req, res) => {
    getDashboardData
      .getGFWListDashboardData(req, req.body.list_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });

  /**
   * @summary Get List Dashboard Timestamp
   */
  app.post('/dashboard/getListDashboardTimestamp', (req, res) => {
    getDashboardData
      .getDashboardTimestamp(req, req.body.list_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });

  /**
   * @summary Get GFW List Dashboard Timestamp
   */
  app.post('/dashboard/getGFWListDashboardTimestamp', (req, res) => {
    getDashboardData
      .getGFWDashboardTimestamp(req, req.body.list_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });
};
