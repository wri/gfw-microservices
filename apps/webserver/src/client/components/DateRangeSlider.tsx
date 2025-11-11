import { useState, useEffect, useRef } from 'react';
import { Slider, Box, TextField, Typography, SxProps, Theme } from '@mui/material';
import { theme } from '../styles/theme';

const MILLISECONDS_PER_DAY = 86400000;

/**
 * Formats a timestamp to ISO date string (YYYY-MM-DD)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - ISO date string
 */
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

/**
 * Formats a timestamp to display date string (MM/DD/YYYY)
 * Uses UTC to avoid timezone offset issues
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - Formatted date string
 */
const formatDisplayDate = (timestamp) => {
  const date = new Date(timestamp);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
};

const dateInputStyles: SxProps<Theme> = {
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

interface DateRangeSliderProps {
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  disabled?: boolean;
  onDateChange: (startDate: string, endDate: string) => void;
}

export const DateRangeSlider = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  disabled = false,
  onDateChange,
}: DateRangeSliderProps) => {
  const initialStartDate = new Date(startDate).getTime();
  const initialEndDate = new Date(endDate).getTime();
  const minDateTimestamp = new Date(minDate).getTime();
  const maxDateTimestamp = new Date(maxDate).getTime();

  const [dateRange, setDateRange] = useState([initialStartDate, initialEndDate]);
  const [startDateInput, setStartDateInput] = useState(formatDate(initialStartDate));
  const [endDateInput, setEndDateInput] = useState(formatDate(initialEndDate));
  const startDateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endDateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newStart = new Date(startDate).getTime();
    const newEnd = new Date(endDate).getTime();
    setDateRange([newStart, newEnd]);
    setStartDateInput(formatDate(newStart));
    setEndDateInput(formatDate(newEnd));
  }, [startDate, endDate]);

  useEffect(() => {
    return () => {
      if (startDateTimeoutRef.current) clearTimeout(startDateTimeoutRef.current);
      if (endDateTimeoutRef.current) clearTimeout(endDateTimeoutRef.current);
    };
  }, []);

  const handleDateChange = (_, newValue) => {
    setDateRange(newValue);
    setStartDateInput(formatDate(newValue[0]));
    setEndDateInput(formatDate(newValue[1]));
  };

  const handleDateChangeCommitted = (_, newValue) => {
    const [newStartTimestamp, newEndTimestamp] = newValue;
    const newStartDate = formatDate(newStartTimestamp);
    const newEndDate = formatDate(newEndTimestamp);
    onDateChange(newStartDate, newEndDate);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setStartDateInput(newValue);

    if (!newValue) return;

    const newStartDate = new Date(newValue).getTime();
    if (newStartDate >= minDateTimestamp && newStartDate <= dateRange[1] && !isNaN(newStartDate)) {
      setDateRange([newStartDate, dateRange[1]]);

      if (startDateTimeoutRef.current) {
        clearTimeout(startDateTimeoutRef.current);
      }

      // add 1 second debounce before triggering the update
      startDateTimeoutRef.current = setTimeout(() => {
        onDateChange(formatDate(newStartDate), formatDate(dateRange[1]));
      }, 1000);
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setEndDateInput(newValue);

    if (!newValue) return;

    const newEndDate = new Date(newValue).getTime();
    if (newEndDate <= maxDateTimestamp && newEndDate >= dateRange[0] && !isNaN(newEndDate)) {
      setDateRange([dateRange[0], newEndDate]);

      if (endDateTimeoutRef.current) {
        clearTimeout(endDateTimeoutRef.current);
      }

      endDateTimeoutRef.current = setTimeout(() => {
        onDateChange(formatDate(dateRange[0]), formatDate(newEndDate));
      }, 1000);
    }
  };

  return (
    <Box sx={{ mr: 2.5, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
          From
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
          disabled={disabled}
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
          disabled={disabled}
          sx={dateInputStyles}
        />
      </Box>

      <Slider
        value={dateRange}
        onChange={handleDateChange}
        onChangeCommitted={handleDateChangeCommitted}
        valueLabelDisplay="off"
        min={minDateTimestamp}
        max={maxDateTimestamp}
        step={MILLISECONDS_PER_DAY}
        marks={[
          { value: minDateTimestamp, label: formatDisplayDate(minDateTimestamp) },
          { value: maxDateTimestamp, label: formatDisplayDate(maxDateTimestamp) },
        ]}
        disabled={disabled}
        sx={{
          color: theme.palette.primary.main,
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
          },
          '& .MuiSlider-markLabel': {
            fontSize: '0.75rem',
          },
          '& .MuiSlider-markLabel[data-index="0"]': {
            left: '9% !important',
          },
          '& .MuiSlider-markLabel[data-index="1"]': {
            left: '90% !important',
          },
        }}
      />
    </Box>
  );
};
