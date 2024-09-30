import { readAnalysesLastModifiedTime } from '@wri-monorepos/shared';
import { S3Service } from '@wri-monorepos/aws';

export const getAnalysesLastModifiedTime = async (req, res) => {
  const s3 = new S3Service();
  try {
    const data = await readAnalysesLastModifiedTime(s3);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching last modified times:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
