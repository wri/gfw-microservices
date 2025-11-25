import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SxProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { PillButton } from '../../../../../../components';
import { useState } from 'react';
import { Close } from '@mui/icons-material';

interface AlertsDateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (date: { startDate: string; endDate: string }) => void;
}

export const AlertsDateSelector = ({ isOpen, onClose, onDownload }: AlertsDateSelectorProps) => {
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  const isDateRangeValid =
    startDateInput !== '' && endDateInput !== '' && startDateInput <= endDateInput;

  return (
    <Dialog open={isOpen} onClose={onClose} sx={{ '& .MuiPaper-root': { width: '450px' } }}>
      <DialogTitle
        data-cy="download-dialog"
        sx={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <Typography variant="h6">Download Reports</Typography>
        <Close fontSize="small" onClick={onClose} sx={{ cursor: 'pointer' }} />
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Select a date range to generate your report. Your choice will only apply to this download.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
          <Typography variant="body2">Select start date:</Typography>
          <TextField
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            size="small"
            sx={dateInputStyles}
          />
          <Typography variant="body2">Select end date:</Typography>
          <TextField
            type="date"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            size="small"
            sx={dateInputStyles}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <PillButton onClick={onClose} color="info">
          Cancel
        </PillButton>
        <PillButton
          variant="contained"
          onClick={() => onDownload({ startDate: startDateInput, endDate: endDateInput })}
          disabled={!isDateRangeValid}
        >
          Download
        </PillButton>
      </DialogActions>
    </Dialog>
  );
};

const dateInputStyles: SxProps<Theme> = {
  flex: 1,
  '& .MuiOutlinedInput-input': {
    padding: '2px 6px',
    fontSize: '0.8125rem',
  },
};
