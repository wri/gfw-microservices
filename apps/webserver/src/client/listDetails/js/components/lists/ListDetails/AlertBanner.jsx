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
  onButtonClick,
}) {
  return (
    <Alert
      sx={{
        backgroundColor,
        color,
        display: 'flex',
        alignItems: 'center',
        py: 1,
        m: 1,
        border: `1px solid ${darkenColor(backgroundColor)}`,
        '& .MuiAlert-message': {
          maxWidth: '1200px',
          margin: 'auto',
        },
        '& .MuiAlert-action': {
          marginRight: 'auto',
        },
      }}
      icon={false}
      action={
        onButtonClick && (
          <PillButton
            style={{
              background: 'white',
              color: buttonTextColor,
              borderRadius: '20px',
              padding: '10px 20px',
              width: '220px',
            }}
            size="small"
            onClick={onButtonClick}
            aria-label={buttonText}
          >
            {buttonText}
          </PillButton>
        )
      }
    >
      <AlertTitle
        sx={{ color, textTransform: 'none', display: 'flex', alignItems: 'center', gap: 1 }}
      >
        {icon}
        {title}
      </AlertTitle>
      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
        {message}
      </Typography>
    </Alert>
  );
}
