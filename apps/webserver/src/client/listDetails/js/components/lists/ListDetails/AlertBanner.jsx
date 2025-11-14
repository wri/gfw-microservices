import { Alert, AlertTitle, Typography } from '@mui/material';
import { PillButton } from '../../../../../components';
import { darkenColor } from '../../../../../utils/utils';

export default function AlertBanner({
  title,
  backgroundColor,
  color,
  icon,
  message,
  buttonText,
  buttonTextColor,
  borderColor,
  onButtonClick,
}) {
  const alertStyles = getAlertStyles(backgroundColor, color, borderColor);
  const alertTitleStyles = getAlertTitleStyles(color);
  const iconStyles = getIconContainerStyles(borderColor);

  const action = onButtonClick ? (
    <PillButton
      sx={{
        backgroundColor: (theme) => theme.palette.background.default,
        color: buttonTextColor,
        textTransform: 'none',
        borderRadius: '5px',
        letterSpacing: 0,
        minWidth: 125,
        border: `1px solid ${darkenColor('#FFFFFF')}`,
        '&:hover': {
          backgroundColor: darkenColor('#FFFFFF', 6),
        },
      }}
      size="small"
      onClick={onButtonClick}
      aria-label={buttonText}
    >
      {buttonText}
    </PillButton>
  ) : null;

  return (
    <Alert sx={alertStyles} icon={false} action={action}>
      <div style={iconStyles}>{icon}</div>
      <div style={textContainerStyles}>
        {title && <AlertTitle sx={alertTitleStyles}>{title}</AlertTitle>}

        <Typography variant="body2">{message}</Typography>
      </div>
    </Alert>
  );
}

// Styles
const getIconContainerStyles = (borderColor) => ({
  alignSelf: 'flex-start',
  paddingTop: '2px',
  color: borderColor,
  '& svg': {
    fill: borderColor,
  },
});

const textContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const getAlertTitleStyles = (color) => ({
  color,
  textTransform: 'none',
  margin: 0,
  marginBottom: '4px',
});

const getAlertStyles = (backgroundColor, color, borderColor) => ({
  backgroundColor,
  color,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  py: 1,
  m: 1,
  border: `1px solid ${borderColor || darkenColor(backgroundColor)}`,
  '& .MuiAlert-message': {
    maxWidth: '1200px',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  '& .MuiAlert-action': {
    marginRight: 'auto',
  },
});
