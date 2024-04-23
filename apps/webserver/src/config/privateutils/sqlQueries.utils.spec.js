import { getQueryStr } from '@wri-monorepos/sql';

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
    const sqlQuery = getQueryStr(isSystemQuery, storedProcedureName);
    expect(sqlQuery).not.toBeNull();

    const wrongDBquery = getQueryStr(!isSystemQuery, storedProcedureName);
    expect(wrongDBquery).toBeNull();
  };

  it('Check a non existing query', () => {
    const Query = getQueryStr(true, 'NonExistingQuery');
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
