import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  shape: {
    borderRadius: 5,
  },
  spacing: 8,
  palette: {
    primary: {
      main: '#9FC642', // same as 500
      dark: '#516E10',
      light: '#EDF7D7',
      contrastText: '#1A210B',
      100: '#FBFFF2',
      200: '#EDF7D7',
      300: '#D4E4AF',
      400: '#B8D279',
      500: '#9FC642',
      600: '#719223',
      700: '#516E10',
      800: '#344116',
      900: '#1A210B',
    },
    secondary: {
      main: '#58A9CD', // TODO should be the same as 500, sync up with design team
      light: '#d4eafc',
      contrastText: '#1A210B',
      100: '#F6F5FF',
      200: '#E8E6FB',
      300: '#D0CBF6',
      400: '#6656E1',
      500: '#5646D0',
      600: '#4C3EAF',
      700: '#3D3487',
      800: '#2E2765',
      900: '#241E4F',
    },
    info: {
      main: '#E0E0E0',
      contrastText: '#3E3E3C',
    },
    text: {
      primary: '#404041',
      secondary: '#767575',
    },
    success: {
      100: '#EBF5F2',
      300: '#C2E5DC',
      500: '#009E77',
      700: '#00664D',
    },
    warning: {
      main: '#FFA500',
      100: '#FBF7EA',
      300: '#EEDDA5',
      500: '#A88100',
      700: '#715804',
    },
    error: {
      main: '#F44336', // TODO should be the same as 500, sync up with design team
      100: '#FFEFED',
      300: '#F6C5C1',
      500: '#C11101',
      700: '#8D0D01',
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
      fontWeight: '500',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: '500',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: '500',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: '500',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: '500',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: '500',
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
