import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  shape: {
    borderRadius: 5,
  },
  spacing: 8,
  palette: {
    primary: {
      main: '#9FC642',
      light: '#EDF7D7',
      contrastText: '#1A210B',
    },
    secondary: {
      main: '#58A9CD',
      contrastText: '#FFF',
    },
    info: {
      main: '#E0E0E0',
      contrastText: '#3E3E3C',
    },
    text: {
      primary: '#404041',
      secondary: '#767575',
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: 'Fira Sans, sans-serif',
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.25rem',
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.75rem',
    },
    h4: {
      fontSize: '1.5rem',
    },
    h5: {
      fontSize: '1.25rem',
    },
    h6: {
      fontSize: '1.125rem',
    },
    subtitle1: {
      fontSize: '1.125rem',
    },
    subtitle2: {
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: '0.9375rem',
    },
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
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& input[type="number"]': {
            MozAppearance: 'textfield', // Firefox
            appearance: 'none', // Chrome, Safari
          },
          '& input[type="number"]::-webkit-outer-spin-button': {
            display: 'none', // Chrome
          },
          '& input[type="number"]::-webkit-inner-spin-button': {
            display: 'none', // Chrome
          },
        },
      },
    },
  },
});
