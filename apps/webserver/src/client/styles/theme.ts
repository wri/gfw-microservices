import { createTheme, Theme, PaletteColor } from '@mui/material/styles';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    pill: true;
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#97bd3d',
      dark: '#69842a',
      contrastText: '#fff',
    },
    secondary: {
      main: '#58a9cd',
      dark: '#3a7c99',
      contrastText: '#fff',
    },
    info: {
      main: '#e5e5de',
      dark: 'rgb(0,0,0,0.4)',
      contrastText: '#3e3e3c',
    },
  },
  typography: {
    fontFamily: 'Fira Sans, sans-serif',
    fontSize: 16,
  },
  components: {
    MuiSvgIcon: {
      styleOverrides: {
        fontSizeSmall: {
          fontSize: '1rem',
        },
        fontSizeMedium: {
          fontSize: '2rem',
        },
        fontSizeLarge: {
          fontSize: '3rem',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'pill', color: 'primary' },
          style: ({ theme }) => buttonStyles(theme, 'primary'),
        },
        {
          props: { variant: 'pill', color: 'secondary' },
          style: ({ theme }) => buttonStyles(theme, 'secondary'),
        },
        {
          props: { variant: 'pill', color: 'info' },
          style: ({ theme }) => buttonStyles(theme, 'info'),
        },
      ],
    },
  },
});

const buttonStyles = (theme: Theme, color: keyof typeof theme.palette) => {
  const paletteColor = theme.palette[color] as PaletteColor;

  return {
    borderRadius: '20px',
    padding: '0.5rem 2rem',
    backgroundColor: paletteColor.main,
    color: paletteColor.contrastText,
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: paletteColor.dark,
    },
    '&:focus': {
      outline: `2px solid ${paletteColor.dark}`,
    },
  };
};
