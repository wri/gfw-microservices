import { useEffect, useState } from 'react';
import { Box, Slider, Typography, SxProps, Theme, SliderProps } from '@mui/material';
import { theme } from '../styles/theme';

type YearRangeValue = [number, number];

type SliderValueLabelFormat = NonNullable<SliderProps['valueLabelFormat']>;

type ValueLabelDisplay = NonNullable<SliderProps['valueLabelDisplay']>;

interface YearRangeSliderProps {
  startYear: number;
  endYear: number;
  minYear: number;
  maxYear: number;
  disabled?: boolean;
  marks?: SliderProps['marks'];
  onYearChange: (startYear: number, endYear: number) => void;
  rangeLabelFormat?: (startYear: number, endYear: number) => string;
  valueLabelDisplay?: ValueLabelDisplay;
  valueLabelFormat?: SliderValueLabelFormat;
  sliderSx?: SxProps<Theme>;
}

const defaultRangeLabelFormat = (startYear: number, endYear: number) =>
  `From ${startYear} to ${endYear}`;

const defaultValueLabelFormat: SliderValueLabelFormat = (value) => `${value}`;

export const YearRangeSlider = ({
  startYear,
  endYear,
  minYear,
  maxYear,
  disabled = false,
  marks,
  onYearChange,
  rangeLabelFormat = defaultRangeLabelFormat,
  valueLabelDisplay = 'off',
  valueLabelFormat = defaultValueLabelFormat,
  sliderSx,
}: YearRangeSliderProps) => {
  const [value, setValue] = useState<YearRangeValue>([startYear, endYear]);

  const baseSliderStyles: SxProps<Theme> = {
    color: theme.palette.primary.main,
    '& .MuiSlider-thumb': {
      width: 16,
      height: 16,
    },
    '& .MuiSlider-markLabel': {
      fontSize: '0.75rem',
    },
  };

  const combinedSliderStyles: SxProps<Theme> = !sliderSx
    ? baseSliderStyles
    : Array.isArray(sliderSx)
    ? ([baseSliderStyles, ...sliderSx] as SxProps<Theme>)
    : ([baseSliderStyles, sliderSx] as SxProps<Theme>);

  useEffect(() => {
    setValue([startYear, endYear]);
  }, [startYear, endYear]);

  const handleChange = (_: unknown, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      const [newStartYear, newEndYear] = newValue;
      setValue([newStartYear, newEndYear]);
    }
  };

  const handleChangeCommitted = (_: unknown, newValue: number | number[]) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    const [newStartYear, newEndYear] = newValue;
    onYearChange(newStartYear, newEndYear);
  };

  const rangeLabel = rangeLabelFormat(value[0], value[1]);

  return (
    <Box>
      <Typography variant="body2" sx={{ fontSize: '0.8125rem', mb: 1, mx: 'auto' }}>
        {rangeLabel}
      </Typography>
      <Slider
        value={value}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay={valueLabelDisplay}
        valueLabelFormat={valueLabelFormat}
        min={minYear}
        max={maxYear}
        step={1}
        marks={marks}
        disabled={disabled}
        sx={combinedSliderStyles}
      />
    </Box>
  );
};
