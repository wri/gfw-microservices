const { getQueryStr } = require('./sqlQueries.utils');
const MAIN_DB = 'gfwpro';
const ORG_DB = 'clientstore-TestOrg';
process.env.MSSQL_DATABASE = MAIN_DB;

const SQLSYSTEMCONFIG = {
  server: 'fakehost',
  port: 9999,
  database: MAIN_DB,
  user: 'fakeUser',
  password: 'fakePassword',
  requestTimeout: 90000,
  options: {
    encrypt: false,
  },
};

const SQLORGCONFIG = {
  server: 'fakehost',
  port: 9999,
  database: ORG_DB,
  user: 'fakeUser',
  password: 'fakePassword',
  requestTimeout: 90000,
  options: {
    encrypt: false,
  },
};

describe('Test New Raw Queries', () => {
  const SystemStoredProcedureNames = [
    'uspGetAdministrativeAreasInfo',
    'uspGetProtectedAreasInfo',
    'uspGetInitialUserRouteInfo',
    'uspGetGFWProRootUserInfo',
    'uspGetVerifiedUserRouteInfo',
    'uspGetOrganizationStatus',
    'uspGetTemplateMetadata',
    'uspGetTemplatesDropdown',
    'uspGetUserAuthenticationPreferences',
    'uspGetUsersAuthenticationPreferences',
    'uspGetLocationsCount',
    'uspGetGfwLists',
  ];

  const OrganizationStoredProcedures = [
    'uspSetActivityLog',
    'uspGetUserInfo',
    'uspGetUserStatus',
    'uspGetAllLists',
    'uspGetUsersList',
    'uspGetUserInternalShareLists',
    'uspGetFolders',
    'uspGetAllFolderItems',
    'uspGetActivityLog',
  ];

  const checkQuery = (storedProcedureName, isSystemQuery = true) => {
    const sqlQuery = getQueryStr(
      isSystemQuery ? SQLSYSTEMCONFIG : SQLORGCONFIG,
      storedProcedureName
    );
    expect(sqlQuery).not.toBeNull();

    const wrongDBquery = getQueryStr(
      isSystemQuery ? SQLORGCONFIG : SQLSYSTEMCONFIG,
      storedProcedureName
    );
    expect(wrongDBquery).toBeNull();
  };

  it('Check a non existing query', () => {
    const Query = getQueryStr(SQLSYSTEMCONFIG, 'NonExistingQuery');
    expect(Query).toBe(null);
  });

  SystemStoredProcedureNames.forEach((storedProcedureName) => {
    it(`Check ${storedProcedureName}`, () => {
      checkQuery(storedProcedureName);
    });
  });

  OrganizationStoredProcedures.forEach((storedProcedureName) => {
    it(`Check ${storedProcedureName}`, () => {
      checkQuery(storedProcedureName, false);
    });
  });
});
