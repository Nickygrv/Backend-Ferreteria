const mysql = require('mysql');

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ferreteria'
};

// Creación de la conexión
const connection = mysql.createConnection(dbConfig);

// Conexión a la base de datos
connection.connect((error) => {
  if (error) throw error;
  console.log('Conexión exitosa a la base de datos');
});

// Exportación del objeto de conexión
module.exports = connection;