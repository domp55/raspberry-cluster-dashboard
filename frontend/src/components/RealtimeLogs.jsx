// frontend/src/components/RealtimeLogs.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Chip,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Terminal,
  PlayArrow,
  Pause,
  Delete,
  Download,
  Search,
  Info,
  Warning,
  Error,
  CheckCircle
} from '@mui/icons-material';

const RealtimeLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedPod, setSelectedPod] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState('default');
  const [logLevel, setLogLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);

  // Datos simulados de pods disponibles
  const [availablePods] = useState([
    { name: 'nginx-deployment-7d6c8b7b4d-abc123', namespace: 'default' },
    { name: 'nginx-deployment-7d6c8b7b4d-def456', namespace: 'default' },
    { name: 'api-service-5f8d9c6a2b-ghi789', namespace: 'production' },
    { name: 'database-6c7e8f9a1b-jkl012', namespace: 'production' },
    { name: 'monitoring-agent-8a9b1c2d3e-mno345', namespace: 'kube-system' }
  ]);

  const [namespaces] = useState(['default', 'production', 'kube-system', 'monitoring']);

  // Simular logs en tiempo real
  useEffect(() => {
    if (!isStreaming || !selectedPod) return;

    const logMessages = [
      { level: 'info', message: 'Server started on port 3000' },
      { level: 'info', message: 'Connected to database successfully' },
      { level: 'warn', message: 'High memory usage detected: 85%' },
      { level: 'error', message: 'Failed to connect to external service' },
      { level: 'info', message: 'Processing user request: GET /api/users' },
      { level: 'info', message: 'Request completed in 45ms' },
      { level: 'warn', message: 'Slow query detected: 2.3s' },
      { level: 'error', message: 'Timeout connecting to Redis cache' },
      { level: 'info', message: 'Health check passed' },
      { level: 'info', message: 'Metrics exported to Prometheus' }
    ];

    const interval = setInterval(() => {
      const randomMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
      const newLog = {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        level: randomMessage.level,
        pod: selectedPod,
        namespace: selectedNamespace,
        message: randomMessage.message,
        container: 'main'
      };

      setLogs(prev => {
        const updated = [...prev, newLog];
        return updated.slice(-1000);
      });
    }, 1500 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [isStreaming, selectedPod, selectedNamespace]);

  // Filtrar logs basado en criterios
  useEffect(() => {
    let filtered = logs;

    if (logLevel !== 'all') {
      filtered = filtered.filter(log => log.level === logLevel);
    }

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.pod.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, logLevel, searchTerm]);

  // Auto scroll a los logs más recientes
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  const startStreaming = () => {
    if (!selectedPod) {
      alert('Por favor selecciona un pod primero');
      return;
    }
    setIsStreaming(true);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
  };

  const clearLogs = () => {
    setLogs([]);
    setFilteredLogs([]);
  };

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => 
      `${log.timestamp.toISOString()} [${log.level.toUpperCase()}] ${log.pod}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPod}-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'error':
        return <Error sx={{ color: 'error.main', fontSize: 16 }} />;
      case 'warn':
        return <Warning sx={{ color: 'warning.main', fontSize: 16 }} />;
      case 'info':
        return <Info sx={{ color: 'info.main', fontSize: 16 }} />;
      default:
        return <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />;
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return { color: 'error.main', backgroundColor: 'error.light', borderColor: 'error.main' };
      case 'warn':
        return { color: 'warning.main', backgroundColor: 'warning.light', borderColor: 'warning.main' };
      case 'info':
        return { color: 'info.main', backgroundColor: 'info.light', borderColor: 'info.main' };
      default:
        return { color: 'text.primary', backgroundColor: 'grey.50', borderColor: 'grey.300' };
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ backgroundColor: 'grey.900', color: 'white', p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Terminal />
            <Typography variant="h5" fontWeight="bold">
              Logs en Tiempo Real
            </Typography>
            <Box ml="auto" display="flex" alignItems="center" gap={1}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: isStreaming ? 'success.main' : 'grey.500',
                  animation: isStreaming ? 'pulse 2s infinite' : 'none'
                }} 
              />
              <Typography variant="body2">
                {isStreaming ? 'Streaming' : 'Detenido'}
              </Typography>
            </Box>
          </Box>

          {/* Controles */}
          <Box display="flex" flexWrap="wrap" gap={2}>
            <TextField
              select
              label="Namespace"
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              size="small"
              sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.1)' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiOutlinedInput-input': { color: 'white' }
              }}
            >
              {namespaces.map(ns => (
                <MenuItem key={ns} value={ns}>{ns}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Pod"
              value={selectedPod}
              onChange={(e) => setSelectedPod(e.target.value)}
              size="small"
              sx={{ 
                minWidth: 250,
                '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.1)' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiOutlinedInput-input': { color: 'white' }
              }}
            >
              <MenuItem value="">Seleccionar pod...</MenuItem>
              {availablePods
                .filter(pod => pod.namespace === selectedNamespace)
                .map(pod => (
                  <MenuItem key={pod.name} value={pod.name}>{pod.name}</MenuItem>
                ))}
            </TextField>

            <TextField
              select
              label="Nivel"
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              size="small"
              sx={{ 
                minWidth: 120,
                '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.1)' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiOutlinedInput-input': { color: 'white' }
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warn">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </TextField>

            <TextField
              label="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ color: 'white', mr: 1 }} />
              }}
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.1)' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiOutlinedInput-input': { color: 'white' }
              }}
            />

            <Box display="flex" gap={1}>
              {!isStreaming ? (
                <Button
                  onClick={startStreaming}
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrow />}
                  size="small"
                >
                  Iniciar
                </Button>
              ) : (
                <Button
                  onClick={stopStreaming}
                  variant="contained"
                  color="error"
                  startIcon={<Pause />}
                  size="small"
                >
                  Detener
                </Button>
              )}
              
              <IconButton onClick={clearLogs} sx={{ color: 'white' }} size="small">
                <Delete />
              </IconButton>
              
              <IconButton 
                onClick={downloadLogs} 
                disabled={filteredLogs.length === 0}
                sx={{ color: 'white' }} 
                size="small"
              >
                <Download />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Información del estado */}
        <Box sx={{ px: 3, py: 1, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'grey.200' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={3}>
              <Typography variant="body2">
                Total logs: <strong>{filteredLogs.length}</strong>
              </Typography>
              {searchTerm && (
                <Typography variant="body2">
                  Filtrados de: <strong>{logs.length}</strong>
                </Typography>
              )}
              {selectedPod && (
                <Typography variant="body2">
                  Pod: <strong>{selectedPod}</strong>
                </Typography>
              )}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="caption">Auto-scroll</Typography>}
            />
          </Box>
        </Box>

        {/* Área de logs */}
        <Box sx={{ height: 500, overflow: 'auto', backgroundColor: 'grey.900', p: 2 }}>
          {filteredLogs.length === 0 ? (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="grey.400">
              <Box textAlign="center">
                <Terminal sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  No hay logs disponibles
                </Typography>
                <Typography variant="body2">
                  {!selectedPod 
                    ? 'Selecciona un pod e inicia el streaming'
                    : !isStreaming 
                    ? 'Haz clic en "Iniciar" para comenzar el streaming'
                    : 'Esperando logs...'
                  }
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {filteredLogs.map((log) => (
                <Box
                  key={log.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    p: 1,
                    mb: 0.5,
                    borderLeft: 4,
                    borderColor: getLogColor(log.level).borderColor,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ mt: 0.5 }}>
                    {getLogIcon(log.level)}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="caption" sx={{ color: 'grey.400' }}>
                        {log.timestamp.toLocaleTimeString()}
                      </Typography>
                      <Chip 
                        label={log.level.toUpperCase()} 
                        size="small"
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: getLogColor(log.level).backgroundColor,
                          color: getLogColor(log.level).color
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>
                        {log.container}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'white', 
                        wordBreak: 'break-word',
                        fontFamily: 'monospace'
                      }}
                    >
                      {searchTerm ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: log.message.replace(
                              new RegExp(`(${searchTerm})`, 'gi'),
                              '<mark style="background-color: yellow; color: black; padding: 2px; border-radius: 2px;">$1</mark>'
                            )
                          }}
                        />
                      ) : (
                        log.message
                      )}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={logsEndRef} />
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default RealtimeLogs;