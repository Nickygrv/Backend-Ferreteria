import { createConnection } from './bdd.js';
import { expect } from 'chai';

describe('Database Connection', function () {
    let connection;

    before(function (done) {
        // Crea la conexión antes de las pruebas
        connection = createConnection();
        connection.connect((error) => {
            if (error) {
                return done(error); // Si hay un error, terminamos con el error
            }
            console.log('Conexión exitosa a la base de datos');
            done(); // Si la conexión es exitosa, continuamos
        });
    });

    it('should connect to the database successfully', function (done) {
        // Verificamos la conexión utilizando un ping
        connection.ping((error) => {
            expect(error).to.be.null; // Espera que no haya errores
            done();
        });
    });

    after(function (done) {
        // Cierra la conexión después de las pruebas
        connection.end((error) => {
            if (error) {
                console.error('Error al cerrar la conexión', error);
            } else {
                console.log('Conexión cerrada');
            }
            done(); // Asegura que se complete el cierre de la conexión
        });
    });
});
