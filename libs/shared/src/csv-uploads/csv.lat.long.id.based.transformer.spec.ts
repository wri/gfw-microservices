import { csvLatLongIdBasedTransformer } from '.';
import { umlLookUp } from './uml.lat.long.lookup';
import { carLookup } from './carid.lat.long.lookup';
import { Logger } from '@nestjs/common';

jest.mock('./uml.lat.long.lookup', () => ({
  umlLookUp: jest.fn(),
}));
jest.mock('./carid.lat.long.lookup', () => ({
  carLookup: jest.fn(),
}));

const mockUmlLookUp = umlLookUp as jest.MockedFunction<typeof umlLookUp>;
const mockCarLookUp = carLookup as jest.MockedFunction<typeof carLookup>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('csvLatLongIdBasedTransformer', () => {
  describe('general validations', () => {
    it('throws on empty CSV payload', async () => {
      await expect(csvLatLongIdBasedTransformer([])).rejects.toThrow(
        'Bad CSV Input: No data to process'
      );
    });
    describe('logs to the console the identified idType if valid', () => {
      let logger;

      const umlLogMessage = 'UML ID Based List Identified';
      const carLogMessage = 'CAR ID Based List Identified';

      beforeEach(() => {
        jest.clearAllMocks();
        logger = jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());
      });

      it('UML by ID', async () => {
        const someData = [{ ID: 'M0001' }];
        await expect(csvLatLongIdBasedTransformer(someData)).rejects.toThrow();

        expect(logger).toHaveBeenCalledWith(umlLogMessage);
      });
      it('UML by ID Type', async () => {
        const someData = [{ 'ID Type': 'UML' }];
        await expect(csvLatLongIdBasedTransformer(someData)).rejects.toThrow();

        expect(logger).toHaveBeenCalledWith(umlLogMessage);
      });
      it('UML by "Palm Mill ID"', async () => {
        const someData = [{ 'Palm Mill ID': 'M0001' }];
        await expect(csvLatLongIdBasedTransformer(someData)).rejects.toThrow();

        expect(logger).toHaveBeenCalledWith(umlLogMessage);
      });

      it('CAR by "ID Type"', async () => {
        const someData = [{ 'ID Type': 'CAR' }];
        await expect(csvLatLongIdBasedTransformer(someData)).rejects.toThrow();

        expect(logger).toHaveBeenCalledWith(carLogMessage);
      });
    });
  });

  describe('validation errors for UML', () => {
    describe('throws error if data is identified UML type but', () => {
      it('has missing "Location Name"', async () => {
        const idType = [{ 'ID Type': 'UML', some: 'data', ID: '123', 'Analysis Radius': 99 }];
        const idOnly = [{ ID: '123', 'Analysis Radius': 99 }];
        const expectedMessage = 'Missing mandatory fields: Location Name';

        await expect(csvLatLongIdBasedTransformer(idType)).rejects.toThrow(expectedMessage);
        await expect(csvLatLongIdBasedTransformer(idOnly)).rejects.toThrow(expectedMessage);
      });
      it('has missing "Analysis Radius or Analysis Area" Missing', async () => {
        const idType = [{ 'ID Type': 'UML', some: 'data', ID: '123', 'Location Name': 'Loc 3' }];
        const idOnly = [{ ID: '123', 'Location Name': 'Loc 3' }];
        const expectedMessage = 'Missing mandatory fields: Analysis Radius | Analysis Area';

        await expect(csvLatLongIdBasedTransformer(idType)).rejects.toThrow(expectedMessage);
        await expect(csvLatLongIdBasedTransformer(idOnly)).rejects.toThrow(expectedMessage);
      });
      it('has "ID Type" set to UML but missing the ID column', async () => {
        const idType = [
          { 'ID Type': 'UML', some: 'data', 'Location Name': 'Loc 3', 'Analysis Radius': 99 },
        ];
        const expectedMessage = 'Missing mandatory fields: ID';

        await expect(csvLatLongIdBasedTransformer(idType)).rejects.toThrow(expectedMessage);
      });
    });
  });

  describe('validation errors for CAR', () => {
    describe('throws error if data is identified CAR type but', () => {
      it('has missing "Location Name"', async () => {
        const idType = [{ 'ID Type': 'CAR', some: 'data', ID: '123' }];
        const idOnly = [{ ID: '123', 'Analysis Radius': 99 }];
        const expectedMessage = 'Missing mandatory fields: Location Name';

        await expect(csvLatLongIdBasedTransformer(idType)).rejects.toThrow(expectedMessage);
        await expect(csvLatLongIdBasedTransformer(idOnly)).rejects.toThrow(expectedMessage);
      });
      it('has missing "ID"', async () => {
        const idType = [{ 'ID Type': 'CAR', some: 'data', 'Location Name': 'Loc 3' }];
        const expectedMessage = 'Missing mandatory fields: ID';

        await expect(csvLatLongIdBasedTransformer(idType)).rejects.toThrow(expectedMessage);
      });
    });
  });

  describe('handle', () => {
    it("calls UML lookup and merges geometry when 'ID Type' === 'UML'", async () => {
      mockUmlLookUp.mockImplementation(async (ids: string[]) => {
        return ids.reduce((o, id) => ({ ...o, [id]: { geometry: `geom-${id}` } }), {});
      }) as unknown;

      const rows = [
        { 'ID Type': 'UML', ID: '123', 'Location Name': 'Loc mill', 'Analysis Radius': 21 },
      ];
      const result = await csvLatLongIdBasedTransformer(rows);

      expect(mockUmlLookUp).toHaveBeenCalledWith(['123']);
      expect(result[0].geometry).toBe('geom-123');
    });

    it("calls CAR lookup and merges geometry when 'ID Type' === 'CAR'", async () => {
      mockCarLookUp.mockImplementation(async (ids: string[]) =>
        ids.reduce((o, id) => ({ ...o, [id]: { geometry: `geom-${id}` } }), {})
      );

      const rows = [{ 'ID Type': 'CAR', ID: 'ABC', 'Location Name': 'Loc car' }];
      const result = await csvLatLongIdBasedTransformer(rows);

      expect(mockCarLookUp).toHaveBeenCalledWith(['ABC']);
      expect(result[0].geometry).toBe('geom-ABC');
    });

    it("defaults to UML lookup when 'ID' exists but the 'ID Type' column is absent", async () => {
      mockUmlLookUp.mockResolvedValue({ '321': { geometry: 'geom-321' } as unknown });

      const rows = [{ ID: '321', 'Location Name': 'Loc 321', 'Analysis Radius': 21 }];
      const result = await csvLatLongIdBasedTransformer(rows);

      expect(mockUmlLookUp).toHaveBeenCalledWith(['321']);
      expect(result[0].geometry).toBe('geom-321');
    });

    it('throws for an unsupported ID Type', async () => {
      const rows = [{ 'ID Type': 'XYZ', ID: '999' }];

      await expect(csvLatLongIdBasedTransformer(rows)).rejects.toThrow(
        'The defined ID system value is not recognized by GFW Pro. Please enter a recognized ID system value'
      );
      expect(mockUmlLookUp).not.toHaveBeenCalled();
      expect(mockCarLookUp).not.toHaveBeenCalled();
    });

    it('throws for an unsupported ID Type with mixed values', async () => {
      const rows = [
        { 'ID Type': 'CAR', ID: '999', 'Location Name': 'Locar' },
        { 'ID Type': 'XYZ', ID: '999', 'Location Name': 'Locar' },
      ];

      await expect(csvLatLongIdBasedTransformer(rows)).rejects.toThrow(
        'The defined ID system value is not recognized by GFW Pro. Please enter a recognized ID system value'
      );
      expect(mockUmlLookUp).not.toHaveBeenCalled();
      expect(mockCarLookUp).toHaveBeenCalled();
    });

    it('processes records in the correct chunk size for UML (1 000 rows)', async () => {
      const CHUNK_SIZE = 1000; // as defined in the source for UML
      const TOTAL = CHUNK_SIZE + 200; // forces two chunks

      mockUmlLookUp.mockImplementation(async (ids: string[]) =>
        ids.reduce((o, id) => ({ ...o, [id]: { geometry: 'geom' } }), {})
      );

      const rows = Array.from({ length: TOTAL }, (_, i) => ({
        'ID Type': 'UML',
        'Location Name': 'Locmil',
        'Analysis Radius': 29,
        ID: `MILL000${i}`,
      }));

      const result = await csvLatLongIdBasedTransformer(rows);

      expect(mockUmlLookUp).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(TOTAL);
      expect(result.every((r) => r.geometry === 'geom')).toBe(true);
    });

    it('returns data unchanged when data is not ID Based', async () => {
      const rows = [{ label: 'foo' }];
      const result = await csvLatLongIdBasedTransformer(rows);

      expect(result).toBe(rows);
      expect(mockUmlLookUp).not.toHaveBeenCalled();
      expect(mockCarLookUp).not.toHaveBeenCalled();
    });
  });
});
