// frontend/src/App.js

import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EnhancedHeader from './components/EnhancedHeader';
import EnhancedMonitor from './components/EnhancedMonitor';
import RealtimeLogs from './components/RealtimeLogs';
import About from './components/About'; // Tu componente existente
import Home from './components/Home';   // Tu componente existente
import { useWebSocket } from './hooks/useWebSocket';

// Crear tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  // Inicializar el WebSocket hook (no necesitamos usar connectionStatus aquí)
  useWebSocket();

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 0:
        return <Home />;
      case 1:
        return <EnhancedMonitor />;
      case 2:
        return <RealtimeLogs />;
      case 3:
        return <About />;
      default:
        return <Home />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <EnhancedHeader 
          currentTab={currentTab} 
          onTabChange={handleTabChange} 
        />
        <main>
          {renderContent()}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;