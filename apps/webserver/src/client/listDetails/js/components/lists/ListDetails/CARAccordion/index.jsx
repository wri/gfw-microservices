import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ExpandMore, DateRange } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import errorLogger from '../../../../../../common/js/utils/errorLogger';

// STYLES
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: 12,
  padding: 10,
  borderRadius: 4,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.secondary[300]}`,
  backgroundColor: theme.palette.secondary[100],
  color: theme.palette.secondary[900],
  '& .MuiBase-root, & .MuiButtonBase-root': {
    minHeight: 0,
    padding: 0,
  },
  '& .Mui-expanded': {
    marginBottom: 4,
  },
  '& .MuiAccordionSummary-content': {
    margin: 0,
  },
  '& .MuiButtonBase-root.Mui-expanded .hide-when-expanded': {
    display: 'none',
  },
  '& .MuiAccordionDetails-root': {
    padding: 0,
    marginLeft: 12,
    marginRight: 12,
    borderTop: `1px solid ${theme.palette.secondary[300]}`,
  },
  '&::before': {
    display: 'none',
  },
}));

const StyledExpandIcon = styled(ExpandMore)(({ theme }) => ({
  color: theme.palette.secondary[700],
}));

const StyledDateRange = styled(DateRange)(({ theme }) => ({
  marginRight: 8,
  color: theme.palette.secondary[700],
}));

/**
 * Component to show CAR data recency information in an accordion.
 */
const CARAccordion = ({ carLastUpdateDate }) => {
  if (!carLastUpdateDate) {
    return null;
  }

  const formatDateToCarMessage = (carDateString) => {
    try {
      const [year, month, day] = carDateString.split('-').map(Number);
      const carDate = new Date(year, month - 1, day);
      const userLang = navigator.language || navigator.languages[0];
      const formattedDate = new Date(carDate).toLocaleDateString(userLang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return formattedDate;
    } catch {
      errorLogger.error('Error converting the date', {
        component: 'CARAccordion',
        action: 'formatCarDate',
        carDateString,
      });
      return 'N/A';
    }
  };

  return (
    <StyledAccordion>
      <AccordionSummary
        expandIcon={<StyledExpandIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <StyledDateRange fontSize="small" />
        <Typography variant="body2">
          <b>CAR Data Recency</b>
          <span className="hide-when-expanded">
            <b>:</b> Expand to see instructions for assessing how up-to-date your CAR polygon
            boundaries are.
          </span>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" sx={{ pt: 2 }}>
          The most recent CAR dataset available on Pro was retrieved from SICAR databases on{' '}
          {formatDateToCarMessage(carLastUpdateDate)}. If your list's CAR locations show an "ID Data
          Updated" date before {formatDateToCarMessage(carLastUpdateDate)}, you will need to
          re-upload these locations if you want to ensure that they are using the most up-to-date
          CAR polygon boundaries.
        </Typography>
      </AccordionDetails>
    </StyledAccordion>
  );
};

export default CARAccordion;
