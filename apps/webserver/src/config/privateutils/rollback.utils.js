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
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));

const dropDatabase = (req, pendingaccounts_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'pendingaccounts_id', type: sql.Int, value: pendingaccounts_id }
    ];
    sqlUtils.executeSystemStoredProcedure(req, 'uspDropDatabase', parameters).then(() => {
      resolve(true);
    }).catch(err => {
      reject(err);
    });
  });
};

const dropOrganizationTable = (req, table_name) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'table_name', type: sql.NVarChar, value: table_name }
    ];
    sqlUtils.executeOrganizationStoredProcedure(req, 'uspDropOrganizationTable', parameters)
      .then(() => {
        resolve(true);
      }).catch(err => {
        reject(err);
      });
  });
};

const dropSystemTable = (req, table_name) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'table_name', type: sql.NVarChar, value: table_name }
    ];
    sqlUtils.executeSystemStoredProcedure(req, 'uspDropSystemTable', parameters)
      .then(() => {
        resolve(true);
      }).catch(err => {
        reject(err);
      });
  });
};

const deleteOrganizationTableRow = (req, table_name, primary_key, column_name) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'table_name', type: sql.NVarChar, value: 'Lists' },
      { field: 'primary_key', type: sql.Int, value: primary_key },
      { field: 'column', type: sql.NVarChar, value: column_name }
    ];
    sqlUtils.executeOrganizationStoredProcedure(req, 'uspDeleteOrganizationTableRow', parameters)
      .then(() => {
        resolve(true);
      })
      .catch(err => {
        reject(err);
      });
  });
};

const deleteSystemTableRow = (req, table_name, primary_key, column_name) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'table_name', type: sql.NVarChar, value: table_name },
      { field: 'primary_key', type: sql.Int, value: primary_key },
      { field: 'column', type: sql.NVarChar, value: column_name }
    ];
    sqlUtils.executeSystemStoredProcedure(req, 'uspDeleteSystemTableRow', parameters)
      .then(() => {
        resolve(true);
      })
      .catch(err => {
        reject(err);
      });
  });
};

const dropUserRoute = (req, user_email, organization_id, organization_user_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'user_email', type: sql.NVarChar, value: user_email },
      { field: 'organization_id', type: sql.Int, value: organization_id },
      { field: 'organization_user_id', type: sql.Int, value: organization_user_id }
    ];
    sqlUtils.executeSystemStoredProcedure(req, 'uspDropUserRoute', parameters).then(() => {
      resolve(true);
    }).catch(err => {
      reject(err);
    });
  });
};

const deleteUserSecret = (req, user_email) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'user_email', type: sql.NVarChar, value: user_email }
    ];
    sqlUtils.executeSystemStoredProcedure(req, 'uspDeleteUserSecret', parameters).then(() => {
      resolve(true);
    }).catch(err => {
      reject(err);
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
  deleteUserSecret
};
