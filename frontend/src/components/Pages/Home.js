import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import { 
  Computer, 
  Speed, 
  Security, 
  CloudQueue 
} from '@mui/icons-material';

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        component="img"
        src="cluster-background.png" 
        alt="Imagen del Clúster Raspberry Pi"
        sx={{
          width: '100%',
          maxHeight: 400,
          objectFit: 'cover',
          borderRadius: 2,
          mb: 3,
        }}
      />

  <Typography variant="h4" gutterBottom color="primary" align="center">
    Clúster de Raspberry Pi con Kubernetes
  </Typography>

      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ¿Qué es un Clúster de Raspberry Pi?
            </Typography>
            <Typography paragraph>
              Un Clúster de Raspberry Pi es un conjunto de computadoras Raspberry Pi 
              conectadas entre sí que trabajan de manera coordinada para ejecutar 
              aplicaciones distribuidas. Cada Raspberry Pi actúa como un nodo en el 
              Clúster, proporcionando recursos de CPU, memoria y almacenamiento.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Kubernetes en Raspberry Pi
            </Typography>
            <Typography paragraph>
              Kubernetes es una plataforma de orquestación de contenedores que nos 
              permite gestionar y escalar aplicaciones de manera automática. En nuestro 
              Clúster de Raspberry Pi, Kubernetes coordina la ejecución de contenedores 
              Docker a través de múltiples nodos, proporcionando alta disponibilidad 
              y balanceamento de carga.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Beneficios del Clúster
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Speed color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Alto Rendimiento" 
                  secondary="Procesamiento distribuido" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Alta Disponibilidad" 
                  secondary="Tolerancia a fallos" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CloudQueue color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Escalabilidad" 
                  secondary="Fácil adición de nodos" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Computer color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Costo Efectivo" 
                  secondary="Hardware económico" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Casos de Uso
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Desarrollo y Testing
              </Typography>
              <Typography variant="body2">
                Ideal para desarrollar y probar aplicaciones containerizadas 
                antes de desplegarlas en producción.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Aplicaciones Web
              </Typography>
              <Typography variant="body2">
                Hosting de aplicaciones web con balanceamiento de carga 
                automático y alta disponibilidad.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Microservicios
              </Typography>
              <Typography variant="body2">
                Despliegue y gestión de arquitecturas de microservicios 
                de manera eficiente.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                IoT y Edge Computing
              </Typography>
              <Typography variant="body2">
                Procesamiento de datos en el edge para aplicaciones 
                de Internet of Things.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 3, mt: 3 }}>
  <Typography variant="h6" gutterBottom align="center" color="primary">
    Video Demostrativo
  </Typography>
  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <iframe
      width="100%"
      height="400"
      src="https://www.youtube.com/embed/6WthsF9rsC8?si=j7yfX21jN_zqMPtj"
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    ></iframe>
  </Box>
</Paper>

    </Container>
  );
};

export default Home;