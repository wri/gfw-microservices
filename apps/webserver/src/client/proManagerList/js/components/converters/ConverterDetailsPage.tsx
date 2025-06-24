import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

interface Params {
  id: string;
}

export default function ConverterDetailsPage() {
  const { id } = useParams<Params>();
  const [job, setJob] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setJob(id);
    // fetchConverterInfo(id);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Typography variant="h3">Converter Details</Typography>
      <pre>{JSON.stringify(job, null, 2)}</pre>
    </div>
  );
}
