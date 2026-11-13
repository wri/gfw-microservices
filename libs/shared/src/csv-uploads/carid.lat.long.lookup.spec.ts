import axios from 'axios';
import { carLookup } from './carid.lat.long.lookup';
import { readLastUpdatedDateSicar } from './read.last.updated.date.sicar';

jest.mock('axios');
jest.mock('./read.last.updated.date.sicar', () => ({
  readLastUpdatedDateSicar: jest.fn(),
}));

const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>;
const mockedReadLastUpdated = readLastUpdatedDateSicar as jest.MockedFunction<
  typeof readLastUpdatedDateSicar
>;

const VALID_CAR_ID = 'TO-1701903-BDF7049077694A9A8FFB13E1D88EE3F5';

const getSqlParam = (): string => {
  const [, config] = mockedAxiosGet.mock.calls[0];
  return (config as { params: { sql: string } }).params.sql;
};

describe('carLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedReadLastUpdated.mockResolvedValue({ idDataUpdated: '2025-08-01' });
    mockedAxiosGet.mockResolvedValue({ data: { data: [] } } as never);
  });

  describe('SQL injection protection', () => {
    it('rejects IDs containing single quotes without querying', async () => {
      const maliciousId = "TO-1' OR '1'='1";

      const result = await carLookup([maliciousId]);

      expect(mockedAxiosGet).not.toHaveBeenCalled();
      expect(result[maliciousId]).toEqual({
        errorDetails: [`CAR LookUp: invalid string format for ID ${maliciousId}`],
      });
    });

    it('rejects IDs containing SQL comment or statement separators', async () => {
      const maliciousIds = ['TO-1; DROP TABLE mytable--', 'TO-1) OR (1=1', 'TO-1 OR 1=1'];

      const result = await carLookup(maliciousIds);

      expect(mockedAxiosGet).not.toHaveBeenCalled();
      maliciousIds.forEach((id) => {
        expect(result[id].errorDetails).toEqual([`CAR LookUp: invalid string format for ID ${id}`]);
      });
    });

    it('only queries the valid IDs when the input is mixed', async () => {
      const maliciousId = "TO-1' OR '1'='1";

      const result = await carLookup([VALID_CAR_ID, maliciousId]);

      expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
      expect(getSqlParam()).toBe(
        `SELECT property_c,geom FROM mytable WHERE property_c IN ('${VALID_CAR_ID}')`
      );
      expect(getSqlParam()).not.toContain("'1'='1");
      expect(result[maliciousId].errorDetails).toEqual([
        `CAR LookUp: invalid string format for ID ${maliciousId}`,
      ]);
    });

    it('returns early without querying when no IDs are valid', async () => {
      const result = await carLookup(["' OR 1=1--"]);

      expect(mockedAxiosGet).not.toHaveBeenCalled();
      expect(mockedReadLastUpdated).not.toHaveBeenCalled();
      expect(result["' OR 1=1--"].errorDetails).toBeDefined();
    });
  });

  describe('valid IDs', () => {
    it('queries all valid IDs in a single IN clause', async () => {
      const ids = [VALID_CAR_ID, 'MT-5103908-A97D2521B35B4CB1B4368D26457BB3D1'];

      await carLookup(ids);

      expect(getSqlParam()).toBe(
        `SELECT property_c,geom FROM mytable WHERE property_c IN ('${ids[0]}','${ids[1]}')`
      );
    });

    it('marks valid IDs missing from the response as not found', async () => {
      const result = await carLookup([VALID_CAR_ID]);

      expect(result[VALID_CAR_ID]).toEqual({
        errorDetails: [`CAR LookUp: did not find lat/long for ${VALID_CAR_ID}`],
      });
    });
  });
});
