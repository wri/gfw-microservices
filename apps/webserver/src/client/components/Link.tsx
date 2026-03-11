import { styled } from '@mui/material/styles';
import LinkMui from '@mui/material/Link';

export const Link = styled(LinkMui)<{ color?: string }>(({ theme, color }) => {
  const linkPalette = theme.palette.link || {};
  const resolvedColor = color || linkPalette.main || '#404041';

  return {
    color: resolvedColor,
    textDecorationColor: resolvedColor,
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: '500',
    ':hover': {
      color: linkPalette.hover || '#1A1919',
      textDecorationColor: linkPalette.hover || '#1A1919',
      transition: 'color 0.5s',
    },
    ':active': {
      color: linkPalette.active || '#A1A1A1',
      textDecorationColor: linkPalette.active || '#A1A1A1',
    },
    ':focus-visible': {
      outline: 'none',
      color: linkPalette.hover || '#1A1919',
      textDecorationColor: linkPalette.hover || '#1A1919',
    },
  };
});
