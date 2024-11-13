import mysql from 'mysql';

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ferreteria'
};

// Función para obtener una nueva conexión
const createConnection = () => {
    return mysql.createConnection(dbConfig);
};

// Exportación de la función para crear conexiones
export { createConnection };
