const express = require('express');
const app = express();
const cors = require('cors-express');
const swaggerUi = require('swagger-ui-express'); // Importa swagger-ui-express
const swaggerFile = require('./swagger-output.json'); // Importa el archivo generado de Swagger
const db = require('./bdd');
const router = require('./routes');

// Configurar Express para recibir solicitudes POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
require('./swagger'); // Ejecuta swagger.js para generar la documentación

// Configurar la documentación de Swagger en el endpoint /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Habilitar CORS utilizando cors-express
app.use(cors({
  allowedOrigins: ['http://localhost:4200'], // Reemplaza con la URL de tu cliente
  allowedMethods: ['GET', 'PUT', 'POST'], // Especifica los métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Especifica los encabezados permitidos
}));

// Utilizar el enrutador para manejar todas las solicitudes
app.use(router);

// Inicio del servidor
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
