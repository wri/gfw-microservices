import { useState, ElementType, MouseEvent } from 'react';
import {
  Typography,
  ButtonBase,
  SxProps,
  Theme,
  Popover,
  Box,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  StepIconProps,
  styled,
} from '@mui/material';
import { Check, Close, Info, Email, Publish } from '@mui/icons-material';

interface FileValidationHelperProps {
  sx?: SxProps<Theme>;
}

const ColorStepIconRoot = styled(Box)<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme }) => ({
  zIndex: 1,
  color: '#B0B0B0',
  width: 30,
  height: 30,
  display: 'flex',
  borderRadius: '50%',
  border: '2px solid #B0B0B0',
  justifyContent: 'center',
  alignItems: 'center',
  variants: [
    {
      props: ({ ownerState }) => ownerState.active || ownerState.completed,
      style: {
        border: `2px solid ${theme.palette.primary.dark}`,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.dark,
      },
    },
  ],
}));

function ColorStepIcon(props: StepIconProps, Icon: ElementType) {
  const { active, completed, className } = props;

  return (
    <ColorStepIconRoot ownerState={{ completed, active }} className={className}>
      <Icon fontSize="small" />
    </ColorStepIconRoot>
  );
}

export function FileValidationHelper({ sx }: FileValidationHelperProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => setAnchorEl(null);

  const isPopoverOpen = !!anchorEl;
  const id = isPopoverOpen ? 'popover' : undefined;

  return (
    <>
      <ButtonBase
        sx={{
          backgroundColor: 'primary.light',
          width: 'fit-content',
          borderRadius: 1,
          px: 1.5,
          py: 0.5,
          ...sx,
        }}
        onClick={handleClick}
      >
        <Typography variant="caption" sx={{ color: 'primary.dark' }}>
          How do we validate your file for upload?
        </Typography>
        <Info fontSize="small" sx={{ ml: 1 }} />
      </ButtonBase>
      <Popover
        id={id}
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              ml: 1,
            },
          },
        }}
      >
        <Box sx={{ width: '320px' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              backgroundColor: 'primary.light',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: '500' }}>
              File Validation Process:
            </Typography>
            <IconButton onClick={handlePopoverClose} aria-label="close file validation popover">
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Stepper
            activeStep={0}
            orientation="vertical"
            sx={{
              m: 1.5,
              p: 1.5,
              backgroundColor: 'background.default',
              borderRadius: 1,
              '& .MuiStepLabel-root': { alignItems: 'start' },
              '& .MuiStepConnector-vertical': { ml: '15px' },
            }}
          >
            <Step key={1}>
              <StepLabel StepIconComponent={(props) => ColorStepIcon(props, Check)}>
                <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: '1rem' }}>
                  Initial check. This ensures your file is formatted correctly and has the necessary
                  obligatory columns for the data type you are uploading.
                </Typography>
              </StepLabel>
            </Step>
            <Step key={2}>
              <StepLabel StepIconComponent={(props) => ColorStepIcon(props, Publish)}>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: '1rem' }}>
                  After submitting for analysis we run a validation to check if your locations are
                  on land and have valid geometries. If they do not, we notify you about errors in
                  your upload.
                </Typography>
              </StepLabel>
            </Step>
            <Step key={3}>
              <StepLabel StepIconComponent={(props) => ColorStepIcon(props, Email)}>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: '1rem' }}>
                  Once your list is validated and analyzed, you will receive an email notifying you
                  your results are ready. If any of your locations failed analysis, you will be
                  notified when you explore you analysis in your List Details page.
                </Typography>
              </StepLabel>
            </Step>
          </Stepper>
        </Box>
      </Popover>
    </>
  );
}
