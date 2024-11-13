const { requestNewAccount } = require('./accountManager.utils');
const AWSSES = require('../privateutils/ses.utils');
const snsUtils = require('../privateutils/sns.utils');
const sqlUtils = require('../privateutils/sql.utils');

jest.mock('../privateutils/sql.utils', () => ({
  executeSystemStoredProcedure: jest.fn(),
}));

jest.mock('../privateutils/sns.utils', () => ({
  publish: jest.fn(),
}));

describe('requestNewAccount', () => {
  it('should handle the database response from uspCreateNewAccount', async () => {
    const req = {}; // mock or real request object
    const org_country = 'Brazil';
    const testParams = {
      req,
      org_name: 'Test Org',
      org_address: '123 Test St',
      org_country,
      org_website: 'https://example.com',
      parent_org_name: 'Parent Org',
      is_subsidiary: true,
      arr_org_classification_ids: [1, 2, 3],
      user_first_name: 'John',
      user_middle_initial: 'M',
      user_last_name: 'Doe',
      user_email: 'john.doe@example.com',
      user_phone: '123-456-7890',
      user_title_id: 1,
      other_title: 'Developer',
      arr_user_geography_ids: [1],
      arr_user_commodity_ids: [1, 2],
      policyList: [],
      policyNames: [],
    };

    // Mock return value for the stored procedure
    const mockRecordset = [{ organization_id: 12345 }];
    sqlUtils.executeSystemStoredProcedure.mockResolvedValue(mockRecordset);

    // Act
    await requestNewAccount(...Object.values(testParams));

    // Assert
    expect(snsUtils.publish).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        org_country: testParams.org_country,
      })
    );
  });
});
