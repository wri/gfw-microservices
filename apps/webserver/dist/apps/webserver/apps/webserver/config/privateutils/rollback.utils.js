/** ******************************************************************
*   @name: rollback.utils.js
*   @description : A utility file to perform rollback functionality
                  within the SQL databases on errors

*   @function {dropDatabase}
*   @function {dropOrganizationTable}
*   @function {dropSystemTable}
*   @function {deleteOrganizationTableRow}
*   @function {deleteSystemTableRow}
*
********************************************************************/
const path = require('path');
const sql = require('mssql');
const logger = require('./logger.utils');
const sqlUtils = require('./sql.utils');

const dropDatabase = (req, pendingaccounts_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'pendingaccounts_id', type: sql.Int, value: pendingaccounts_id }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspDropDatabase', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        // don't propagate errors during rollback because they can trigger app crash
        logger.error('Ignoring error from rollback.utils:dropDatabase', err);
      });
  });
};

const dropOrganizationTable = (req, table_name) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'table_name', type: sql.NVarChar(255), value: table_name }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspDropOrganizationTable', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        // don't propagate errors during rollback because they can trigger app crash
        logger.error('Ignoring error from rollback.utils:dropOrganizationTable', err);
      });
  });
};

const dropSystemTable = (req, table_name) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'table_name', type: sql.NVarChar(255), value: table_name }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspDropSystemTable', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        // don't propagate errors during rollback because they can trigger app crash
        logger.error('Ignoring error from rollback.utils:dropSystemTable', err);
      });
  });
};

const deleteOrganizationTableRow = (req, table_name, primary_key, column_name) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'table_name', type: sql.NVarChar(255), value: table_name },
      { field: 'primary_key', type: sql.Int, value: primary_key },
      { field: 'column', type: sql.NVarChar(255), value: column_name },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspDeleteOrganizationTableRow', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        // don't propagate errors during rollback because they can trigger app crash
        logger.error('Ignoring error from rollback.utils:deleteOrganizationTableRow', err);
      });
  });
};

const deleteSystemTableRow = (req, table_name, primary_key, column_name) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'table_name', type: sql.NVarChar(255), value: table_name },
      { field: 'primary_key', type: sql.Int, value: primary_key },
      { field: 'column', type: sql.NVarChar(255), value: column_name },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspDeleteSystemTableRow', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        // don't propagate errors during rollback because they can trigger app crash
        logger.error('Ignoring error from rollback.utils:deleteSystemTableRow', err);
      });
  });
};

const dropUserRoute = (req, user_email, organization_id, organization_user_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'user_email', type: sql.NVarChar(255), value: user_email },
      { field: 'organization_id', type: sql.Int, value: organization_id },
      { field: 'organization_user_id', type: sql.Int, value: organization_user_id },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspDropUserRoute', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        // don't propagate errors during rollback because they can trigger app crash
        logger.error('Ignoring error from rollback.utils:dropUserRoute', err);
      });
  });
};

const deleteUserSecret = (req, user_email) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'user_email', type: sql.NVarChar(255), value: user_email }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspDeleteUserSecret', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        // don't propagate errors during rollback because they can trigger app crash
        logger.error('Ignoring error from rollback.utils:deleteUserSecret', err);
      });
  });
};

module.exports = {
  dropDatabase,
  dropOrganizationTable,
  dropSystemTable,
  deleteSystemTableRow,
  deleteOrganizationTableRow,
  dropUserRoute,
  deleteUserSecret,
};
