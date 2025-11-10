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
  const alertStyles = {
    backgroundColor,
    color,
    display: 'flex',
    alignItems: 'center',
    py: 1,
    m: 1,
    border: `1px solid ${borderColor || darkenColor(backgroundColor)}`,
    '& .MuiAlert-message': {
      maxWidth: '1200px',
      margin: 'auto',
    },
    '& .MuiAlert-action': {
      marginRight: 'auto',
    },
  };

  const alertTitleStyles = {
    color,
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  };

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
      <AlertTitle sx={alertTitleStyles}>
        {icon}
        {title}
      </AlertTitle>

      <Typography variant="body2">{message}</Typography>
    </Alert>
  );
}
