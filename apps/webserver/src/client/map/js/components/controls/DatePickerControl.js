import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { theme } from '../../../../styles/theme';

/**
 * Formats a timestamp or Date to ISO date string (YYYY-MM-DD)
 */
const formatDate = (date) => {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
};

const dateInputStyles = {
  flex: 1,
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '2px 6px',
    fontSize: '0.8125rem',
  },
};

export default function DatePickerControl({ start, end, minDate, changeStart, changeEnd }) {
  const minDateTimestamp = new Date(minDate || start).getTime();
  const maxDateTimestamp = new Date().getTime();

  const [startDateInput, setStartDateInput] = useState(formatDate(start));
  const [endDateInput, setEndDateInput] = useState(formatDate(end));
  const [dateRange, setDateRange] = useState([new Date(start).getTime(), new Date(end).getTime()]);

  const startDateTimeoutRef = useRef(null);
  const endDateTimeoutRef = useRef(null);

  useEffect(() => {
    const newStart = new Date(start).getTime();
    const newEnd = new Date(end).getTime();
    setDateRange([newStart, newEnd]);
    setStartDateInput(formatDate(newStart));
    setEndDateInput(formatDate(newEnd));
  }, [start, end]);

  useEffect(() => {
    return () => {
      if (startDateTimeoutRef.current) {
        clearTimeout(startDateTimeoutRef.current);
      }
      if (endDateTimeoutRef.current) {
        clearTimeout(endDateTimeoutRef.current);
      }
    };
  }, []);

  const handleStartDateChange = (event) => {
    const newValue = event.target.value;
    setStartDateInput(newValue);

    if (!newValue) {
      return;
    }

    const newStartDate = new Date(newValue).getTime();
    if (newStartDate >= minDateTimestamp && newStartDate <= dateRange[1] && !isNaN(newStartDate)) {
      setDateRange([newStartDate, dateRange[1]]);

      if (startDateTimeoutRef.current) {
        clearTimeout(startDateTimeoutRef.current);
      }

      startDateTimeoutRef.current = setTimeout(() => {
        changeStart(null, new Date(newStartDate));
      }, 1000);
    }
  };

  const handleEndDateChange = (event) => {
    const newValue = event.target.value;
    setEndDateInput(newValue);

    if (!newValue) {
      return;
    }

    const newEndDate = new Date(newValue).getTime();
    if (newEndDate <= maxDateTimestamp && newEndDate >= dateRange[0] && !isNaN(newEndDate)) {
      setDateRange([dateRange[0], newEndDate]);

      if (endDateTimeoutRef.current) {
        clearTimeout(endDateTimeoutRef.current);
      }

      endDateTimeoutRef.current = setTimeout(() => {
        changeEnd(null, new Date(newEndDate));
      }, 1000);
    }
  };

  return (
    <Box
      className="adhoc-analysis__date-picker-container"
      sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}
    >
      <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
        deforestation alerts from
      </Typography>
      <TextField
        type="date"
        value={startDateInput}
        onChange={handleStartDateChange}
        inputProps={{
          min: formatDate(minDateTimestamp),
          max: formatDate(dateRange[1]),
        }}
        size="small"
        sx={dateInputStyles}
      />
      <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
        to
      </Typography>
      <TextField
        type="date"
        value={endDateInput}
        onChange={handleEndDateChange}
        inputProps={{
          min: formatDate(dateRange[0]),
          max: formatDate(maxDateTimestamp),
        }}
        size="small"
        sx={dateInputStyles}
      />
    </Box>
  );
}
