import React from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  ListItemIcon,
  ListItemText,
  useTheme,
  Button,
} from "@mui/material";
import {
  Computer,
  Speed,
  Security,
  CloudQueue,
  Download,
} from "@mui/icons-material";

const Home = () => {
  const theme = useTheme();

  const beneficios = [
    {
      icon: <Speed />,
      title: "Alto Rendimiento",
      description: "Procesamiento distribuido",
    },
    {
      icon: <Security />,
      title: "Alta Disponibilidad",
      description: "Tolerancia a fallos",
    },
    {
      icon: <CloudQueue />,
      title: "Escalabilidad",
      description: "Fácil adición de nodos",
    },
    {
      icon: <Computer />,
      title: "Costo Efectivo",
      description: "Hardware económico",
    },
  ];

  const casosUso = [
    {
      title: "Desarrollo y Testing",
      description:
        "Ideal para desarrollar y probar aplicaciones containerizadas antes de desplegarlas en producción.",
    },
    {
      title: "Aplicaciones Web",
      description:
        "Hosting de aplicaciones web con balanceamiento de carga automático y alta disponibilidad.",
    },
    {
      title: "Microservicios",
      description:
        "Despliegue y gestión de arquitecturas de microservicios de manera eficiente.",
    },
    {
      title: "IoT y Edge Computing",
      description:
        "Procesamiento de datos en el edge para aplicaciones de Internet of Things.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/fondo.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        color: theme.palette.text.primary,
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            width: "100%",
            overflow: "hidden",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            component="img"
            src="cluster-background.png"
            alt="Imagen del Clúster Raspberry Pi"
            sx={{
              width: "100%",
              height: 400,
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box
            sx={{
              textAlign: "center",
              mb: 10,
              color: theme.palette.common.white,
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 300, mb: 3, letterSpacing: 1 }}
            >
              Soluciones de Clúster con Raspberry Pi
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 300,
                maxWidth: 800,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Infraestructura escalable y eficiente para sus necesidades de
              computación distribuida
            </Typography>
          </Box>

          <Grid container spacing={6} sx={{ mb: 8 }}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  background: theme.palette.background.paper,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "0.3s",
                  "&:hover": { boxShadow: theme.shadows[6] },
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ mb: 4, position: "relative", fontWeight: 400 }}
                >
                  ¿Qué es un Clúster de Raspberry Pi?
                  <Box
                    sx={{
                      height: 2,
                      width: 60,
                      mt: 2,
                      bgcolor: theme.palette.primary.main,
                    }}
                  />
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                  Un Clúster de Raspberry Pi es un conjunto de computadoras
                  Raspberry Pi conectadas entre sí que trabajan de manera
                  coordinada para ejecutar aplicaciones distribuidas. Cada
                  Raspberry Pi actúa como un nodo en el Clúster, proporcionando
                  recursos de CPU, memoria y almacenamiento.
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ mb: 4, position: "relative", fontWeight: 400 }}
                >
                  Kubernetes en Raspberry Pi
                  <Box
                    sx={{
                      height: 2,
                      width: 60,
                      mt: 2,
                      bgcolor: theme.palette.primary.main,
                    }}
                  />
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  Kubernetes es una plataforma de orquestación de contenedores
                  que nos permite gestionar y escalar aplicaciones de manera
                  automática. En nuestro Clúster de Raspberry Pi, Kubernetes
                  coordina la ejecución de contenedores Docker a través de
                  múltiples nodos, proporcionando alta disponibilidad y
                  balanceamiento de carga.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Sección combinada: Beneficios y Casos de Uso */}
          <Paper
            elevation={0}
            sx={{
              p: 6,
              mb: 8,
              background: theme.palette.background.paper,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 6, fontWeight: 400 }}
            >
              Beneficios y Casos de Uso
              <Box
                sx={{
                  height: 2,
                  width: 60,
                  mt: 3,
                  mx: "auto",
                  bgcolor: theme.palette.primary.main,
                }}
              />
            </Typography>

            {/* Beneficios */}
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                }}
              >
                Beneficios del Clúster
              </Typography>
              <Grid container spacing={3}>
                {beneficios.map((item, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        borderRadius: 1,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Box
                          sx={{
                            background: theme.palette.primary.main,
                            color: "#fff",
                            borderRadius: "50%",
                            p: 1.2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 400 }}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {item.description}
                          </Typography>
                        }
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Casos de Uso */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                }}
              >
                Casos de Uso
              </Typography>
              <Grid container spacing={3}>
                {casosUso.map((item, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body3"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>

          {/* Video Sección 
          <Paper
            elevation={0}
            sx={{
              p: 6,
              background: theme.palette.background.paper,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{
                mb: 6,
                fontWeight: 400,
                position: "relative",
                "&:after": {
                  content: '""',
                  display: "block",
                  width: 60,
                  height: 2,
                  backgroundColor: theme.palette.primary.main,
                  mt: 3,
                  mx: "auto",
                },
              }}
            >
              Video Demostrativo
            </Typography>
            
             
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <iframe
                width="100%"
                height="450"
                src="https://www.youtube.com/embed/6WthsF9rsC8?si=j7yfX21jN_zqMPtj"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  maxWidth: "800px",
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            </Box>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Download />}
                component="a"
                href="/comandosClusterKubernetes.txt"
                download="comandosClusterKubernetes.txt"
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 1,
                  fontSize: "0.9rem",
                  textTransform: "none",
                }}
              >
                Descargar Comandos
              </Button>
            </Box> 
            
          </Paper>
          */ }
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
