import { Container, Box, Typography, Button, Link } from '@mui/material';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';

import { ExternalLinks } from '../../../../../utils/constants';

const AnalysisFailedMessage = ({ toggleReRunAnalysisDialog }) => {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="60vh"
        textAlign="center"
      >
        <Box mb={2}>
          <ReportGmailerrorredIcon style={{ fontSize: 100, color: '#F24E1E', opacity: 0.5 }} />
        </Box>
        <Typography variant="h5" gutterBottom>
          Analysis has failed
        </Typography>
        <Typography variant="body1" gutterBottom>
          All your list's locations have failed analysis. Read more about how to avoid and address
          analysis failures{' '}
          <Link
            href={ExternalLinks.HowToAddressErrorsInUpload}
            color="#F24E1E"
            target="_blank"
            component="a"
            sx={{ textDecoration: 'none' }}
          >
            here
          </Link>
          .
        </Typography>
        <Box mt={3} mb={2}>
          <Button
            style={{
              background: '#F24E1E',
              color: 'white',
              borderRadius: '20px',
              padding: '10px 20px',
            }}
            size="large"
            onClick={toggleReRunAnalysisDialog}
          >
            TRY AGAIN
          </Button>
        </Box>
        <Typography variant="body2">
          If the problem persists please contact
          <br />
          <Link
            href={ExternalLinks.ZendeskSupport}
            color="#F24E1E"
            target="_blank"
            sx={{ textDecoration: 'none' }}
          >
            GFW Pro support here
          </Link>{' '}
          for further information.
        </Typography>
      </Box>
    </Container>
  );
};

export default AnalysisFailedMessage;
