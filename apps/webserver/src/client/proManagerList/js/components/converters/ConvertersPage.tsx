import { Grid } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';

import ConvertersList from './ConvertersList';
import ConverterDetailsPage from './ConverterDetailsPage';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ConvertersPage({ setIsLoading }) {
  const history = useHistory();
  const location = useLocation();
  const query = useQuery();
  const converterId = query.get('id');

  // Handler to navigate to a converter job detail page
  const goToConverterDetails = (id) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'converters');
    params.set('id', id);

    history.push({
      pathname: '',
      search: params.toString(),
    });
  };

  return (
    <Grid container justifyContent="space-between">
      {converterId ? (
        <ConverterDetailsPage />
      ) : (
        <ConvertersList setIsLoading={setIsLoading} onViewJobDetails={goToConverterDetails} />
      )}
    </Grid>
  );
}
