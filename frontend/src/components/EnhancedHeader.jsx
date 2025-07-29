// frontend/src/components/EnhancedHeader.jsx

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Memory,
  Home,
  Info,
  Terminal,
  Settings,
  Notifications,
  Search,
  AccountCircle,
  Logout,
  DarkMode,
  LightMode,
  Wifi,
  WifiOff,
  Warning,
  Error,
  CheckCircle,
  Refresh
} from '@mui/icons-material';

const EnhancedHeader = ({ currentTab, onTabChange }) => {
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Alto uso de memoria',
      message: 'El nodo worker-2 está usando 85% de memoria',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false
    },
    {
      id: 2,
      type: 'error',
      title: 'Pod fallido',
      message: 'monitoring-agent ha fallado y necesita reinicio',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Deployment exitoso',
      message: 'api-service v2.1.0 desplegado correctamente',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: true
    }
  ]);

  const tabs = [
    { id: 0, label: 'Home', icon: Home },
    { id: 1, label: 'Monitor', icon: Memory },
    { id: 2, label: 'Logs', icon: Terminal },
    { id: 3, label: 'Acerca de', icon: Info }
  ];

  // Simular cambios de estado de conexión
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldDisconnect = Math.random() < 0.05;
      setConnectionStatus(shouldDisconnect ? 'disconnected' : 'connected');
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Simular nuevas notificaciones
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const newNotification = {
          id: Date.now(),
          type: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
          title: ['Nuevo evento', 'Alerta del sistema', 'Actualización'][Math.floor(Math.random() * 3)],
          message: 'Mensaje simulado del sistema de monitoreo',
          timestamp: new Date(),
          read: false
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileClick = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleNotificationsClick = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElProfile(null);
    setAnchorElNotifications(null);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return <Error color="error" fontSize="small" />;
      case 'warning':
        return <Warning color="warning" fontSize="small" />;
      case 'info':
        return <CheckCircle color="info" fontSize="small" />;
      default:
        return <CheckCircle color="primary" fontSize="small" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <AppBar position="static" elevation={2} sx={{ backgroundColor: isDarkMode ? 'grey.900' : 'primary.main' }}>
      <Toolbar>
        {/* Logo y marca */}
        <Box display="flex" alignItems="center" gap={2} sx={{ mr: 4 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <img 
              src="/unl.png" 
              alt="UNL Logo" 
              style={{ height: 32 }} 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <img 
              src="/comp.jpeg" 
              alt="Comp Logo" 
              style={{ height: 32, borderRadius: 4 }} 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Box>
          
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Raspberry Pi Cluster
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {connectionStatus === 'connected' ? (
                <Wifi fontSize="small" color="success" />
              ) : (
                <WifiOff fontSize="small" color="error" />
              )}
              <Typography variant="caption" sx={{ 
                color: connectionStatus === 'connected' ? 'success.light' : 'error.light' 
              }}>
                {connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navegación central */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
          <Tabs 
            value={currentTab} 
            onChange={onTabChange}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.id}
                  icon={<Icon />}
                  label={tab.label}
                  iconPosition="start"
                  sx={{ 
                    minHeight: 48,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 1
                    }
                  }}
                />
              );
            })}
          </Tabs>
        </Box>

        {/* Controles del lado derecho */}
        <Box display="flex" alignItems="center" gap={1}>
          
          {/* Búsqueda */}
          <TextField
            size="small"
            placeholder="Buscar pods, nodos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              display: { xs: 'none', lg: 'block' },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '& input': { color: 'white' }
              }
            }}
          />

          {/* Toggle tema */}
          <Tooltip title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}>
            <IconButton onClick={() => setIsDarkMode(!isDarkMode)} color="inherit">
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton onClick={handleNotificationsClick} color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Perfil de usuario */}
          <Tooltip title="Perfil">
            <IconButton onClick={handleProfileClick} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Menú de notificaciones */}
        <Menu
          anchorEl={anchorElNotifications}
          open={Boolean(anchorElNotifications)}
          onClose={handleClose}
          PaperProps={{
            style: { width: 350, maxHeight: 400 }
          }}
        >
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notificaciones</Typography>
            {unreadCount > 0 && (
              <IconButton size="small" onClick={markAllAsRead}>
                <Refresh fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Divider />
          
          {notifications.length === 0 ? (
            <Box p={3} textAlign="center">
              <Notifications color="disabled" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No hay notificaciones
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  button
                  onClick={() => markAsRead(notification.id)}
                  sx={{
                    backgroundColor: !notification.read ? 'action.hover' : 'transparent',
                    borderLeft: !notification.read ? 3 : 0,
                    borderColor: 'primary.main'
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatTimeAgo(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Menu>

        {/* Menú de perfil */}
        <Menu
          anchorEl={anchorElProfile}
          open={Boolean(anchorElProfile)}
          onClose={handleClose}
        >
          <Box p={2}>
            <Typography variant="subtitle1" fontWeight="bold">Admin</Typography>
            <Typography variant="body2" color="text.secondary">admin@cluster.local</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleClose}>
            <Settings sx={{ mr: 2 }} />
            Configuración
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Logout sx={{ mr: 2 }} />
            Cerrar Sesión
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Navegación móvil */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
        <Tabs 
          value={currentTab} 
          onChange={onTabChange}
          variant="fullWidth"
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.id}
                icon={<Icon fontSize="small" />}
                label={tab.label}
                sx={{ minHeight: 60, fontSize: '0.75rem' }}
              />
            );
          })}
        </Tabs>
      </Box>
    </AppBar>
  );
};

export default EnhancedHeader;