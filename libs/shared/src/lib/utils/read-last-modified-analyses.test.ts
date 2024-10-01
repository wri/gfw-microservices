import { readAnalysesLastModifiedTime, resetCacheForTests } from './read-last-modified-analyses';

const mockS3 = {
  readFileFromS3: jest.fn(),
};

describe('readAnalysesLastModifiedTime', () => {
  beforeEach(() => {
    resetCacheForTests();

    jest.clearAllMocks();
  });

  it('should fetch file contents from S3 and update cache if cache is empty', async () => {
    mockS3.readFileFromS3
      .mockResolvedValueOnce('2024-06-14T15:42:14Z\t2.3.27')
      .mockResolvedValueOnce('2024-06-15T12:34:56Z\t2.4.0')
      .mockResolvedValueOnce('2024-06-16T08:22:10Z\t3.1.1');

    const result = await readAnalysesLastModifiedTime(mockS3);

    const expected = [
      { id: 'FCD', last_run: new Date('2024-06-14T15:42:14Z'), jar_version: '2.3.27' },
      { id: 'AFI', last_run: new Date('2024-06-15T12:34:56Z'), jar_version: '2.4.0' },
      { id: 'ALERTS', last_run: new Date('2024-06-16T08:22:10Z'), jar_version: '3.1.1' },
    ];

    expect(result).toEqual(expected);
    expect(mockS3.readFileFromS3).toHaveBeenCalledTimes(3);
  });

  it('should return cached data if cache is still valid', async () => {
    mockS3.readFileFromS3.mockResolvedValueOnce('2024-06-14T15:42:14Z\t2.3.27');

    const initialResult = await readAnalysesLastModifiedTime(mockS3);

    const cachedResult = await readAnalysesLastModifiedTime(mockS3);

    expect(cachedResult).toEqual(initialResult);
    expect(mockS3.readFileFromS3).toHaveBeenCalledTimes(3);
  });

  it('should fetch data again after cache expires', async () => {
    mockS3.readFileFromS3
      .mockResolvedValueOnce('2024-06-14T15:42:14Z\t2.3.27')
      .mockResolvedValueOnce('2024-06-15T12:34:56Z\t2.4.0')
      .mockResolvedValueOnce('2024-06-16T08:22:10Z\t3.1.1');

    await readAnalysesLastModifiedTime(mockS3);
    expect(mockS3.readFileFromS3).toHaveBeenCalledTimes(3);

    const originalDateNow = Date.now();
    const dateNowSpy = jest
      .spyOn(Date, 'now')
      .mockImplementation(() => originalDateNow + 2 * 60 * 60 * 1000);

    await readAnalysesLastModifiedTime(mockS3);

    expect(dateNowSpy).toHaveBeenCalled();
    expect(mockS3.readFileFromS3).toHaveBeenCalledTimes(3);

    dateNowSpy.mockRestore();
  });

  it('should handle S3 read errors gracefully', async () => {
    mockS3.readFileFromS3
      .mockResolvedValueOnce('2024-06-14T15:42:14Z\t2.3.27')
      .mockRejectedValueOnce(new Error('S3 read error'))
      .mockResolvedValueOnce('2024-06-16T08:22:10Z\t3.1.1');

    const result = await readAnalysesLastModifiedTime(mockS3);

    const expected = [
      { id: 'FCD', last_run: new Date('2024-06-14T15:42:14Z'), jar_version: '2.3.27' },
      { id: 'ALERTS', last_run: new Date('2024-06-16T08:22:10Z'), jar_version: '3.1.1' },
    ];

    expect(result).toEqual(expected);
    expect(mockS3.readFileFromS3).toHaveBeenCalledTimes(3);
  });
});
