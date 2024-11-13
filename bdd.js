import express from 'express';
import cors from 'cors-express'; // Mantén esta importación si utilizas ESM
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger-output.json' assert { type: 'json' };

import * as db from './bdd.js';  // Si `bdd` está en formato ESM
import router from './routes.js';  // Si `routes` está en formato ESM

const app = express();

// Configuración de Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
import './swagger.js'; // Ejecuta swagger.js para generar la documentación

// Configuración de la documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Habilitar CORS utilizando cors-express
app.use(cors({
    allowedOrigins: ['http://localhost:4200'],
    allowedMethods: ['GET', 'PUT', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Utilizar el enrutador
app.use(router);

// Inicio del servidor
app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});
