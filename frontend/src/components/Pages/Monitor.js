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
  Box
} from '@mui/material';
import { kubernetesService } from '../../services/kubernetesService';

const Monitor = () => {
  const [loading, setLoading] = useState(true);
  const [podsData, setPodsData] = useState(null);
  const [nodesData, setNodesData] = useState([]);
  const [deploymentsData, setDeploymentsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pods, nodes, deployments] = await Promise.all([
          kubernetesService.getPods(),
          kubernetesService.getNodes(),
          kubernetesService.getDeployments()
        ]);
        
        setPodsData(pods);
        setNodesData(nodes);
        setDeploymentsData(deployments);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando información del cluster...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Monitor del Cluster
      </Typography>
      
      {/* Resumen de Pods */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Pods Totales
              </Typography>
              <Typography variant="h4">
                {podsData?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                En Ejecución
              </Typography>
              <Typography variant="h4">
                {podsData?.running || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                Pendientes
              </Typography>
              <Typography variant="h4">
                {podsData?.pending || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                Fallidos
              </Typography>
              <Typography variant="h4">
                {podsData?.failed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Estado de Nodos */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Estado de Nodos
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nodo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>CPU</TableCell>
                <TableCell>Memoria</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nodesData.map((node) => (
                <TableRow key={node.name}>
                  <TableCell>{node.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={node.status} 
                      color={node.status === 'Ready' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{node.cpu}</TableCell>
                  <TableCell>{node.memory}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Proyectos Desplegados */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Proyectos Desplegados
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proyecto</TableCell>
                <TableCell>Namespace</TableCell>
                <TableCell>Réplicas Deseadas</TableCell>
                <TableCell>Réplicas Disponibles</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deploymentsData.map((deployment) => (
                <TableRow key={deployment.name}>
                  <TableCell>{deployment.name}</TableCell>
                  <TableCell>{deployment.namespace}</TableCell>
                  <TableCell>{deployment.replicas}</TableCell>
                  <TableCell>{deployment.available}</TableCell>
                  <TableCell>
                    <Chip 
                      label={deployment.replicas === deployment.available ? 'Activo' : 'Parcial'} 
                      color={deployment.replicas === deployment.available ? 'success' : 'warning'} 
                      size="small" 
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

export default Monitor;