import { styled } from '@mui/material/styles';
import LinkMui from '@mui/material/Link';

export const Link = styled(LinkMui)<{ color?: string }>(({ theme, color }) => {
  const resolvedColor = color || theme.palette.text.primary;
  const resolvedHoverColor = color || theme.palette.primary.main;

  return {
    color: resolvedColor,
    textDecorationColor: resolvedColor,
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: '500',
    ':hover': {
      color: resolvedHoverColor,
      transition: 'color 0.5s',
    },
  };
});
