import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Avatar, 
  Box,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Person, Computer, Build, Cloud, AttachMoney } from '@mui/icons-material';

const About = () => {
  const technologies = [
    'Raspberry Pi 4',
    'Kubernetes',
    'Docker',
    'React',
    'Material-UI',
    'Node.js',
    'Linux Ubuntu Server'
  ];

  const teamMembers = [
    'Diego Marquez',
    'Alyce Maldonado',
    'Kevin Sarango',
    'Jhair Ajila',
    'Byron Gonzalez',
    'Nayely Ramirez'
  ];

  const pricingPlans = [
    {
      plan: 'Básico (1 Nodo Worker)',
      cores: '1 (Master) + 1 (Worker)',
      ram: '2 GB (Master) + 1 GB (Worker)',
      storage: '16 GB',
      price: '$1/mes'
    },
    {
      plan: 'Estándar (2 Nodos Worker)',
      cores: '1 (Master) + 2 (Worker)',
      ram: '2 GB (Master) + 2 GB (Worker)',
      storage: '32 GB',
      price: '$5/mes'
    },
    {
      plan: 'Premium (3 Nodos Worker)',
      cores: '1 (Master) + 3 (Worker)',
      ram: '2 GB (Master) + 3 GB (Worker)',
      storage: '48 GB',
      price: '$10/mes'
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom color="primary" align="center">
        Acerca del Proyecto
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Person />
              </Avatar>
              <Typography variant="h6">
                Información del equipo de desarrollo
              </Typography>
            </Box>
            
            <Typography paragraph>
              Este cluster de Raspberry Pi con Kubernetes fue configurado y desarrollado 
              como parte de un un proyecto de aprendizaje en tecnologías de contenedores 
              y orquestación. El objetivo principal es crear un entorno de desarrollo 
              y testing económico pero potente para Apps Web.
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Integrantes del equipo:
            </Typography>
            <ul>
              {teamMembers.map((name) => (
                <li key={name}>
                  <Typography variant="body1">{name}</Typography>
                </li>
              ))}
            </ul>
            
            <Divider sx={{ my: 3 }} />
            
            <Box display="flex" alignItems="center" mb={2}>
              <Computer sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6">
                Configuración del Cluster
              </Typography>
            </Box>
            
            <Typography paragraph>
              <strong>Nodo Master:</strong> Raspberry Pi 4.
            </Typography>
            
            <Typography paragraph>
              <strong>Nodos Worker:</strong> 3x Raspberry Pi 3.
            </Typography>

            <Typography paragraph>
              <strong>Switch:</strong> D-Link DES-1008A.
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box display="flex" alignItems="center" mb={2}>
              <Build sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6">
                Proceso de Instalación
              </Typography>
            </Box>
            
            <Typography paragraph>
              1. Instalación de Ubuntu Server 22.04 LTS en cada Raspberry Pi
            </Typography>
            <Typography paragraph>
              2. Configuración de Docker y containerd como container runtime
            </Typography>
            <Typography paragraph>
              3. Instalación de kubeadm, kubelet y kubectl
            </Typography>
            <Typography paragraph>
              4. Inicialización del cluster y unión de nodos worker
            </Typography>
            <Typography gutterBottom color="primary" align="center">
              Para mayor información visitar el video de nuestra pagina principal
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Cloud sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6">
                Tecnologías Utilizadas
              </Typography>
            </Box>
            
            <Box display="flex" flexWrap="wrap" gap={1}>
              {technologies.map((tech) => (
                <Chip 
                  key={tech} 
                  label={tech} 
                  variant="outlined" 
                  color="primary" 
                  size="small" 
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Pricing Section */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <AttachMoney sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6">
              Planes de Servicio para Despliegue de Aplicaciones Web
            </Typography>
          </Box>
          <Typography paragraph>
            Ofrecemos planes de servicio de bajo costo, diseñados para entornos universitarios y proyectos de desarrollo,
            aprovechando la eficiencia de nuestro cluster de Raspberry Pi con Kubernetes.
          </Typography>
          <TableContainer>
            <Table aria-label="pricing table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Plan de Servicio</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Núcleos (CPU)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>RAM</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Almacenamiento (por nodo)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Pago por uso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pricingPlans.map((row) => (
                  <TableRow key={row.plan}>
                    <TableCell component="th" scope="row">
                      {row.plan}
                    </TableCell>
                    <TableCell>{row.cores}</TableCell>
                    <TableCell>{row.ram}</TableCell>
                    <TableCell>{row.storage}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            *Los planes y características están sujetos a la disponibilidad del hardware del cluster.
            Consulte para opciones personalizadas.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;