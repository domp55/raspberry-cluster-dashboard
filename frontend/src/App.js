import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { theme } from './theme/theme';
import Header from './components/Layout/Header';
import Home from './components/Pages/Home';
import Monitor from './components/Pages/Monitor';
import About from './components/Pages/About';
import { Settings } from '@mui/icons-material';

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 0:
        return <Home />;
      case 1:
        return <Monitor />;
      case 2:
        return <About />;
      default:
        return <Home />;
      
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header currentTab={currentTab} onTabChange={handleTabChange} />
      {renderContent()}
    </ThemeProvider>
  );
}

export default App;