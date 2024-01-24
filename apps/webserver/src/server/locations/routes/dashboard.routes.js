const axios = require('axios');

module.exports = (app) => {
  /**
   * @summary Get Dashboard data from DB
   */
  app.post('/dashboard/getDashboardData', (req, res) => {
    const { LISTS_MICROSERVICE_URL } = process.env;
    const orgDB = req.session.organization_database;
    axios
      .get(
        `${LISTS_MICROSERVICE_URL}/alerts/${req.body.list_id}/dashboardData?clientDatabase=${orgDB}`
      )
      .then((response) => {
        const { data } = response;
        res.send(data);
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
    const { LISTS_MICROSERVICE_URL } = process.env;
    axios
      .get(`${LISTS_MICROSERVICE_URL}/alerts/${req.body.list_id}/GFWListDashboardData`)
      .then((response) => {
        const { data } = response;
        res.send(data);
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
    const { LISTS_MICROSERVICE_URL } = process.env;
    const orgDB = req.session.organization_database;
    axios
      .get(
        `${LISTS_MICROSERVICE_URL}/alerts/${req.body.list_id}/dashboardDataTimestamp?clientDatabase=${orgDB}`
      )
      .then((response) => {
        const { data } = response;
        res.send(data);
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
    const { LISTS_MICROSERVICE_URL } = process.env;
    axios
      .get(`${LISTS_MICROSERVICE_URL}/alerts/${req.body.list_id}/GFWListDashboardDataTimestamp`)
      .then((response) => {
        const { data } = response;
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });
};
