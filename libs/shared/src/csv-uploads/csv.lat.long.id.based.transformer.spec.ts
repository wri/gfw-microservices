import { csvLatLongIdBasedTransformer } from '.';
import { umlLookUp } from './uml.lat.long.lookup';
import { carLookup } from './carid.lat.long.lookup';

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
  it('throws on empty CSV payload', async () => {
    await expect(csvLatLongIdBasedTransformer([])).rejects.toThrow(
      'Bad CSV Input: No data to process'
    );
  });

  it("throws an error if 'ID Type' is present but 'ID' is missing", async () => {
    const rows = [{ 'ID Type': 'UML', some: 'data' }];

    await expect(csvLatLongIdBasedTransformer(rows)).rejects.toThrow(
      'It looks like the file you uploaded is not supported for ID-based upload. ID-based upload requires a .csv or .xlsx file with "ID Type" and "ID" columns present. Please try again with a compatible file format.'
    );
  });

  it("calls UML lookup and merges geometry when 'ID Type' === 'UML'", async () => {
    mockUmlLookUp.mockImplementation(async (ids: string[]) => {
      return ids.reduce((o, id) => ({ ...o, [id]: { geometry: `geom-${id}` } }), {});
    }) as unknown;

    const rows = [{ 'ID Type': 'UML', ID: '123' }];
    const result = await csvLatLongIdBasedTransformer(rows);

    expect(mockUmlLookUp).toHaveBeenCalledWith(['123']);
    expect(result[0].geometry).toBe('geom-123');
  });

  it("calls CAR lookup and merges geometry when 'ID Type' === 'CAR'", async () => {
    mockCarLookUp.mockImplementation(async (ids: string[]) =>
      ids.reduce((o, id) => ({ ...o, [id]: { geometry: `geom-${id}` } }), {})
    );

    const rows = [{ 'ID Type': 'CAR', ID: 'ABC' }];
    const result = await csvLatLongIdBasedTransformer(rows);

    expect(mockCarLookUp).toHaveBeenCalledWith(['ABC']);
    expect(result[0].geometry).toBe('geom-ABC');
  });

  it("defaults to UML lookup when 'ID' exists but the 'ID Type' column is absent", async () => {
    mockUmlLookUp.mockResolvedValue({ '321': { geometry: 'geom-321' } as unknown });

    const rows = [{ ID: '321' }];
    const result = await csvLatLongIdBasedTransformer(rows);

    expect(mockUmlLookUp).toHaveBeenCalledWith(['321']);
    expect(result[0].geometry).toBe('geom-321');
  });

  it('throws for an unsupported ID Type', async () => {
    const rows = [{ 'ID Type': 'XYZ', ID: '999' }];

    await expect(csvLatLongIdBasedTransformer(rows)).rejects.toThrow(
      'No lat/long support for ID XYZ'
    );
    expect(mockUmlLookUp).not.toHaveBeenCalled();
    expect(mockCarLookUp).not.toHaveBeenCalled();
  });

  it('processes records in the correct chunk size for UML (1 000 rows)', async () => {
    const CHUNK_SIZE = 1000; // as defined in the source for UML
    const TOTAL = CHUNK_SIZE + 200; // forces two chunks

    mockUmlLookUp.mockImplementation(async (ids: string[]) =>
      ids.reduce((o, id) => ({ ...o, [id]: { geometry: 'geom' } }), {})
    );

    const rows = Array.from({ length: TOTAL }, (_, i) => ({
      'ID Type': 'UML',
      ID: `id${i}`,
    }));

    const result = await csvLatLongIdBasedTransformer(rows);

    expect(mockUmlLookUp).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(TOTAL);
    expect(result.every((r) => r.geometry === 'geom')).toBe(true);
  });

  it('returns data unchanged when neither ID nor ID Type columns are present', async () => {
    const rows = [{ label: 'foo' }];
    const result = await csvLatLongIdBasedTransformer(rows);

    expect(result).toBe(rows);
    expect(mockUmlLookUp).not.toHaveBeenCalled();
    expect(mockCarLookUp).not.toHaveBeenCalled();
  });
});
