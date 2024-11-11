const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API Documentación',
    description: 'Documentación de la API generada automáticamente',
  },
  host: 'localhost:3000', // Cambia a la URL de tu servidor
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes.js']; // Archivos donde tienes tus rutas

swaggerAutogen(outputFile, endpointsFiles, doc);
