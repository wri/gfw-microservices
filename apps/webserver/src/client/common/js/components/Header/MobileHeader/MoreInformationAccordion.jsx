import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreInformationLinks from '../MoreInformationLinks';

function MoreInformationAccordion() {
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
        <Typography>MORE</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <MoreInformationLinks />
      </AccordionDetails>
    </Accordion>
  );
}

export default MoreInformationAccordion;
