import React from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import { Memory, Home, Info } from '@mui/icons-material';

const Header = ({ currentTab, onTabChange }) => {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        {/* Add your logos here */}
        <img src="/unl.png" alt="Logo 1" style={{ height: 40, marginRight: 10 }} />
        <img src="/comp.jpeg" alt="Logo 2" style={{ height: 40, marginRight: 20 }} /> 
        
        <Memory sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Raspberry Pi Cluster Dashboard
        </Typography>
        <Box>
          <Tabs 
            value={currentTab} 
            onChange={onTabChange} 
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
          >
            <Tab icon={<Home />} label="Home" />
            <Tab icon={<Memory />} label="Monitor" />
            <Tab icon={<Info />} label="Acerca de" />
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;