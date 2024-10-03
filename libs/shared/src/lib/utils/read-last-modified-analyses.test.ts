import {
  readAnalysesLastModifiedTime,
  resetCacheForTests,
  CACHE_IN_HOURS,
} from './read-last-modified-analyses';

const mockS3 = {
  readFileFromS3: jest.fn(),
};

const fcdTxt = '2024-06-14T15:42:14Z\t2.3.27';
const afiTxt = '2024-06-15T12:34:56Z\t2.4.0';
const alertsTxt = '2024-06-16T08:22:10Z\t3.1.1';

describe('readAnalysesLastModifiedTime', () => {
  beforeEach(() => {
    resetCacheForTests();

    jest.clearAllMocks();
  });

  it('should fetch file contents from S3 and update cache if cache is empty', async () => {
    mockS3.readFileFromS3
      .mockResolvedValueOnce(fcdTxt)
      .mockResolvedValueOnce(afiTxt)
      .mockResolvedValueOnce(alertsTxt);

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
    mockS3.readFileFromS3.mockResolvedValueOnce(fcdTxt);

    const initialResult = await readAnalysesLastModifiedTime(mockS3);

    const cachedResult = await readAnalysesLastModifiedTime(mockS3);

    expect(cachedResult).toEqual(initialResult);
    expect(mockS3.readFileFromS3).toHaveBeenCalledTimes(3);
  });

  it('should fetch data again after cache expires', async () => {
    mockS3.readFileFromS3
      .mockResolvedValueOnce(fcdTxt)
      .mockResolvedValueOnce(afiTxt)
      .mockResolvedValueOnce(alertsTxt);

    await readAnalysesLastModifiedTime(mockS3);
    expect(mockS3.readFileFromS3).toHaveBeenCalledTimes(3);

    const dateNowSpy = jest
      .spyOn(Date, 'now')
      .mockImplementation(() => (CACHE_IN_HOURS + 1) * 60 * 60 * 1000);

    await readAnalysesLastModifiedTime(mockS3);

    expect(dateNowSpy).toHaveBeenCalled();
    expect(mockS3.readFileFromS3).toHaveBeenCalledTimes(3);

    dateNowSpy.mockRestore();
  });

  it('should handle S3 read errors gracefully', async () => {
    mockS3.readFileFromS3
      .mockResolvedValueOnce(fcdTxt)
      .mockRejectedValueOnce(new Error('S3 read error'))
      .mockResolvedValueOnce(alertsTxt);

    const result = await readAnalysesLastModifiedTime(mockS3);

    const expected = [
      { id: 'FCD', last_run: new Date('2024-06-14T15:42:14Z'), jar_version: '2.3.27' },
      { id: 'ALERTS', last_run: new Date('2024-06-16T08:22:10Z'), jar_version: '3.1.1' },
    ];

    expect(result).toEqual(expected);
    expect(mockS3.readFileFromS3).toHaveBeenCalledTimes(3);
  });
});
