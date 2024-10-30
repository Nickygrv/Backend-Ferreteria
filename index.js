const express = require('express');
const app = express();
const cors = require('cors-express'); // Importar la biblioteca cors-express
const db = require('./bdd');
const router = require('./routes');

// Configurar Express para recibir solicitudes POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
