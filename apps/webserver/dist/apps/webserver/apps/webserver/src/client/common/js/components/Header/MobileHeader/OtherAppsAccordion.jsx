import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OtherAppsLinks from '../OtherAppsLinks';

function OtherAppsAccordion() {
  return (
    <Accordion
      sx={{
        width: '100%',
        '&:before': {
          display: 'none', // removes shadow in accordion
        },
      }}
      elevation={0}
    >
      <AccordionSummary sx={{ boxShadow: 0 }} expandIcon={<ExpandMoreIcon />}>
        <Typography>APPS</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <OtherAppsLinks />
      </AccordionDetails>
    </Accordion>
  );
}

export default OtherAppsAccordion;
