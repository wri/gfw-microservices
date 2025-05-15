import { Container, Box, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

const AnalysisInProgressMessage = () => {
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
          <CircularProgress size={100} sx={{ color: '#97bd3d', opacity: 0.5 }} />
        </Box>
        <Typography variant="h5" gutterBottom>
          In Analysis!
        </Typography>
        <Typography variant="body1" gutterBottom>
          List is analyzing. You will receive an email once analysis is complete and can reload the
          page to access the results.
        </Typography>
      </Box>
    </Container>
  );
};

export default AnalysisInProgressMessage;
