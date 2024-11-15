// N is the cache duration in hours
export const CACHE_IN_HOURS = 24;
// convert n (hours) to milliseconds for time comparison
const CACHE_DURATION_MS = CACHE_IN_HOURS * 60 * 60 * 1000;

interface AnalysisData {
  id: string;
  last_run: Date;
  jar_version: string;
}

const getBucketName = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'gfwpro-geotrellis-production';
    case 'staging':
      return 'gfwpro-geotrellis-staging';
    default:
      return 'gfwpro-geotrellis';
  }
};

// in-memory cache object
export let cache: {
  timestamp: number;
  data: AnalysisData[];
} | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const readAnalysesLastModifiedTime = async (s3: any) => {
  // if cache exists and is still return it
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
    return cache.data;
  }

  const files = ['fcd.txt', 'afi.txt', 'alerts.txt'];

  const results: AnalysisData[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const fileContents = await s3.readFileFromS3(getBucketName(), `jars/${files[i]}`);

      const fileName = files[i];
      const id = fileName.split('.')[0];
      const [timestamp, jar_version] = fileContents.split('\t');

      results.push({
        id: id.toUpperCase(),
        last_run: new Date(timestamp),
        jar_version: jar_version.trim(),
      });
    } catch (err) {
      console.error(`Error fetching file ${files[i]}:`, err);
    }
  }

  // update cache
  cache = {
    timestamp: Date.now(),
    data: results,
  };

  return results;
};

export const resetCacheForTests = () => {
  cache = {
    timestamp: 0,
    data: [],
  };
};
