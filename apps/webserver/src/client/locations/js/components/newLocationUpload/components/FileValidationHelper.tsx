import { ElementType } from 'react';
import {
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepIconProps,
  styled,
  SxProps,
  Theme,
} from '@mui/material';
import { Check, Email, Publish } from '@mui/icons-material';
import { HelperTextWithPopover } from '../../../../../components';

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
        border: `2px solid ${theme.palette.primary[700]}`,
        backgroundColor: theme.palette.primary[500],
        color: theme.palette.primary[700],
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

interface FileValidationHelperProps {
  sx?: SxProps<Theme>;
}

export function FileValidationHelper({ sx }: FileValidationHelperProps) {
  return (
    <>
      <HelperTextWithPopover
        label={
          <Typography variant="caption" sx={{ color: (theme) => theme.palette.primary[700] }}>
            How do we validate your file for upload?
          </Typography>
        }
        isCloseButtonVisible
        sx={{
          backgroundColor: (theme) => theme.palette.primary[200],
          borderRadius: 1,
          width: 'fit-content',
          px: 1.5,
          py: 0.5,
          ...sx,
        }}
      >
        <Box sx={{ width: '320px' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              backgroundColor: (theme) => theme.palette.primary[200],
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: '500' }}>
              File Validation Process:
            </Typography>
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
      </HelperTextWithPopover>
    </>
  );
}
