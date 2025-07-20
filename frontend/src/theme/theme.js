import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2D5A8C', // Azul profesional
      light: '#5B8BBE',
      dark: '#1C3C64',
    },
    secondary: {
      main: '#748CAB', // Azul grisáceo elegante
    },
    background: {
      default: '#F8F9FA', // Gris muy claro
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1C1E',
      secondary: '#555',
    },
  },
  typography: {
    fontFamily: '"Inter", "Open Sans", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 500,
      fontSize: '2rem',
      letterSpacing: '0.5px',
    },
    h6: {
      fontWeight: 400,
      fontSize: '1.25rem',
      letterSpacing: '0.3px',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // esquinas suaves
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#136bcfff',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
