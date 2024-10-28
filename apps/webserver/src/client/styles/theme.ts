import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#97bd3d',
      contrastText: '#fff',
    },
    secondary: {
      main: '#58a9cd',
      contrastText: '#fff',
    },
    info: {
      main: '#e5e5de',
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
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& input[type="number"]': {
            '-moz-appearance': 'textfield', // Firefox
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
