// N is the cache duration in hours, setting N = 1 will cache for 1 hour
const N = 1;
// convert n (hours) to milliseconds for time comparison
const CACHE_DURATION_MS = N * 60 * 60 * 1000;

const bucketName =
  process.env.NODE_ENV === 'production' ? 'gfwpro-geotrellis-production' : 'gfwpro-geotrellis';

interface AnalysisData {
  id: string;
  last_run: Date;
  jar_version: string;
}

// in-memory cache object
let cache: {
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
      const fileContents = await s3.readFileFromS3(bucketName, `jars/${files[i]}`);

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
