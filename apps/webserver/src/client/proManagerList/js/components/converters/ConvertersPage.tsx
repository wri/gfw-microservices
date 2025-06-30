import { Grid, Typography } from '@mui/material';
import { Switch, Route, useRouteMatch, useHistory } from 'react-router-dom';

import ConvertersList from './ConvertersList';
import ConverterDetailsPage from './ConverterDetailsPage';

export default function ConvertersPage({ setIsLoading }) {
  const { path, url } = useRouteMatch();
  const history = useHistory();

  // Handler to navigate to a converter job detail page
  const goToConverterDetails = (id) => {
    history.push(`${url}converter-job/${id}`);
  };

  return (
    <Switch>
      <Route path={`${path}/converter-job/:id`}>
        <ConverterDetailsPage />
      </Route>

      {/* Default converters list route */}
      <Route path={path}>
        <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
          <Typography variant="h3">Converters</Typography>
          <ConvertersList setIsLoading={setIsLoading} onViewJobDetails={goToConverterDetails} />
        </Grid>
      </Route>
    </Switch>
  );
}
