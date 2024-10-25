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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          padding: '0.5rem 2rem',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});
