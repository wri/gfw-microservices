import { Box, ToggleButton, styled } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import ToggleButtonGroupMui, { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';

type ToggleButtonGroupProps = {
  options: string[];
  selectedOption: string;
  onOptionChange: (option: string) => void;
  sx?: SxProps<Theme>;
};

const StyledToggleButtonGroup = styled(ToggleButtonGroupMui)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.info.main}`,
  width: 'fit-content',

  [`& .${toggleButtonGroupClasses.grouped}`]: {
    padding: '0.25rem 4rem',
    textTransform: 'none',
    border: 'none',
  },

  '& .MuiToggleButtonGroup-grouped.Mui-selected': {
    backgroundColor: 'white',
    color: theme.palette.text.primary,
    height: '80%',
    width: '90%',
    border: `1px solid ${theme.palette.info.main}`,
    borderRadius: theme.shape.borderRadius,
    transition: 'color 0.3s ease',

    '&:hover': {
      backgroundColor: 'white',
    },
  },
}));

export function ToggleButtonGroup({
  options,
  selectedOption,
  onOptionChange,
  sx,
}: ToggleButtonGroupProps) {
  const handleChange = (_: unknown, option: string) => {
    if (!option) {
      return;
    }
    onOptionChange(option);
  };

  return (
    <StyledToggleButtonGroup
      color="primary"
      value={selectedOption}
      exclusive
      onChange={handleChange}
      sx={sx}
    >
      {options.map((option) => (
        <Box
          key={option}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            '&:not(:last-of-type)::after': {
              content: '""',
              position: 'absolute',
              top: '15%',
              bottom: '15%',
              right: 0,
              width: '2px',
              backgroundColor: (theme) => theme.palette.info.main,
            },
          }}
        >
          <ToggleButton value={option.toLowerCase()}>{option}</ToggleButton>
        </Box>
      ))}
    </StyledToggleButtonGroup>
  );
}
