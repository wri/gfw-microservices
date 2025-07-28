import { deleteListByName } from '../support/utils';

describe('Check and Delete Lists created for testing purposes', () => {
  it(
    'should delete lists that contain specific keywords',
    async () => {
      try {
        await deleteListByName([
          'uploadfile',
          'uploadPoint',
          'uploadPolygon',
          'testregression',
          'e2e_automation',
        ]);
      } catch (error) {
        console.error('Test error:', {
          message: error.message,
          stack: error.stack,
        });
        throw error;
      }
    },
    120 * 100000
  );
});
