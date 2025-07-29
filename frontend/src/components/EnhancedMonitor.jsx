// frontend/src/components/EnhancedMonitor.jsx

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Box,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  LinearProgress,
  Badge
} from '@mui/material';
import { 
  Refresh, 
  CheckCircle, 
  Error, 
  Memory,
  Storage,
  Speed,
  NetworkCheck,
  TrendingUp,
  Computer
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const EnhancedMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const connectionStatus = 'connected'; // Valor fijo por ahora
  
  // Estados de datos
  const [clusterMetrics, setClusterMetrics] = useState({
    totalPods: 15,
    runningPods: 13,
    pendingPods: 1,
    failedPods: 1,
    totalNodes: 4,
    readyNodes: 4,
    totalCPU: 4,
    usedCPU: 1.2,
    totalMemory: 8,
    usedMemory: 3.1,
    networkTraffic: 45.6
  });

  const [cpuHistory, setCpuHistory] = useState([
    { time: '10:00', cpu: 20, memory: 35 },
    { time: '10:05', cpu: 25, memory: 40 },
    { time: '10:10', cpu: 18, memory: 38 },
    { time: '10:15', cpu: 30, memory: 45 },
    { time: '10:20', cpu: 28, memory: 42 },
    { time: '10:25', cpu: 35, memory: 48 }
  ]);

  const nodesData = [
    { 
      name: 'master-node', 
      status: 'Ready', 
      cpu: '0.8/2 cores', 
      memory: '1.2/2 GB',
      uptime: '15d 4h',
      role: 'Master',
      cpuPercent: 40,
      memoryPercent: 60
    },
    { 
      name: 'worker-node-1', 
      status: 'Ready', 
      cpu: '0.3/1 cores', 
      memory: '0.6/1 GB',
      uptime: '15d 4h',
      role: 'Worker',
      cpuPercent: 30,
      memoryPercent: 60
    },
    { 
      name: 'worker-node-2', 
      status: 'Ready', 
      cpu: '0.1/1 cores', 
      memory: '0.7/1 GB',
      uptime: '15d 4h',
      role: 'Worker',
      cpuPercent: 10,
      memoryPercent: 70
    },
    { 
      name: 'worker-node-3', 
      status: 'Ready', 
      cpu: '0.2/1 cores', 
      memory: '0.6/1 GB',
      uptime: '15d 4h',
      role: 'Worker',
      cpuPercent: 20,
      memoryPercent: 60
    }
  ];

  const deploymentsData = [
    { name: 'nginx-deployment', namespace: 'default', replicas: 3, available: 3, status: 'Healthy' },
    { name: 'api-service', namespace: 'production', replicas: 2, available: 2, status: 'Healthy' },
    { name: 'database', namespace: 'production', replicas: 1, available: 1, status: 'Healthy' },
    { name: 'monitoring', namespace: 'kube-system', replicas: 1, available: 0, status: 'Unhealthy' }
  ];

  // Simulación de datos en tiempo real
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      const newTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const newCpu = Math.floor(Math.random() * 50) + 10;
      const newMemory = Math.floor(Math.random() * 40) + 30;

      setCpuHistory(prev => {
        const newHistory = [...prev.slice(-5), { time: newTime, cpu: newCpu, memory: newMemory }];
        return newHistory;
      });

      setClusterMetrics(prev => ({
        ...prev,
        usedCPU: (Math.random() * 2 + 0.5).toFixed(1),
        usedMemory: (Math.random() * 3 + 2).toFixed(1),
        networkTraffic: (Math.random() * 100 + 20).toFixed(1)
      }));

      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready': case 'Healthy': return 'success';
      case 'Pending': case 'Warning': return 'warning';
      case 'Failed': case 'Unhealthy': return 'error';
      default: return 'default';
    }
  };

  const getProgressColor = (percent) => {
    if (percent > 80) return 'error';
    if (percent > 60) return 'warning';
    return 'success';
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            Conectando al cluster...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.disabled' }}>
            Obteniendo métricas en tiempo real
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header con controles */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
            Monitor del Cluster
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip 
              icon={<CheckCircle />} 
              label={`${connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}`}
              color={connectionStatus === 'connected' ? 'success' : 'error'}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch 
                checked={realTimeEnabled} 
                onChange={(e) => setRealTimeEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Tiempo Real"
          />
          <Tooltip title="Actualizar datos">
            <IconButton onClick={refreshData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alerta de estado */}
      {deploymentsData.some(d => d.status === 'Unhealthy') && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Algunos servicios requieren atención. Revisa el estado de los deployments.
          </Typography>
        </Alert>
      )}

      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {clusterMetrics.runningPods}/{clusterMetrics.totalPods}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Pods Activos
                  </Typography>
                </Box>
                <Computer sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {((clusterMetrics.usedCPU / clusterMetrics.totalCPU) * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    CPU Utilizada
                  </Typography>
                </Box>
                <Speed sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {((clusterMetrics.usedMemory / clusterMetrics.totalMemory) * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Memoria Usada
                  </Typography>
                </Box>
                <Memory sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {clusterMetrics.networkTraffic}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    MB/s Tráfico
                  </Typography>
                </Box>
                <NetworkCheck sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos de rendimiento */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="primary" />
              Métricas en Tiempo Real
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="CPU %"
                />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stackId="1"
                  stroke="#82ca9d" 
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Memoria %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Estado de Nodos
            </Typography>
            <Box sx={{ overflow: 'auto', height: 'calc(100% - 40px)' }}>
              {nodesData.map((node, index) => (
                <Box key={node.name} sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight="medium">
                      {node.name}
                    </Typography>
                    <Chip 
                      label={node.role} 
                      size="small" 
                      color={node.role === 'Master' ? 'primary' : 'default'}
                    />
                  </Box>
                  <Box mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      CPU: {node.cpuPercent}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={node.cpuPercent} 
                      color={getProgressColor(node.cpuPercent)}
                      sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Memoria: {node.memoryPercent}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={node.memoryPercent} 
                      color={getProgressColor(node.memoryPercent)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabla de deployments mejorada */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Storage color="primary" />
          Aplicaciones Desplegadas
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, backgroundColor: 'grey.50' } }}>
                <TableCell>Aplicación</TableCell>
                <TableCell>Namespace</TableCell>
                <TableCell align="center">Réplicas</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Salud</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deploymentsData.map((deployment) => (
                <TableRow 
                  key={deployment.name}
                  sx={{ 
                    '&:hover': { backgroundColor: 'grey.50' },
                    '& td': { borderBottom: '1px solid #f0f0f0' }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {deployment.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={deployment.namespace} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Badge 
                      badgeContent={deployment.available} 
                      color={deployment.replicas === deployment.available ? 'success' : 'error'}
                      sx={{ '& .MuiBadge-badge': { right: -10 } }}
                    >
                      <Typography variant="body2">
                        {deployment.replicas}
                      </Typography>
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      {deployment.status === 'Healthy' ? 
                        <CheckCircle color="success" fontSize="small" /> : 
                        <Error color="error" fontSize="small" />
                      }
                      <Typography variant="body2">
                        {deployment.replicas === deployment.available ? 'Activo' : 'Degradado'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={deployment.status} 
                      color={getStatusColor(deployment.status)} 
                      size="small"
                      sx={{ minWidth: 80 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default EnhancedMonitor;