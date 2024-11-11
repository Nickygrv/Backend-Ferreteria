const express = require('express');
const router = express.Router();
const db = require('./bdd'); // Configuración de la base de datos

// Ruta para obtener todos los productos
router.get('/api/datos', (req, res) => {
  db.query('SELECT * FROM producto', (error, results) => {
    if (error) {
      console.error('Error al obtener los datos de la base de datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos de la base de datos' });
    } else {
      res.json(results);
    }
  });
});

// Ruta para guardar un producto
router.post('/productos', (req, res) => {
  const { nombre, imagen, descripcion, precio, stock } = req.body;
  const ventainicial = 0;
  const query = 'INSERT INTO producto (nombre, imagen, descripcion, precio, stock, ventas) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [nombre, imagen, descripcion, precio, stock, ventainicial];

  db.query(query, values, (error) => {
    if (error) {
      console.error('Error al guardar el producto:', error);
      res.status(500).json({ message: 'Error al guardar el producto' });
    } else {
      res.status(200).json({ message: 'Producto guardado exitosamente' });
    }
  });
});

// Ruta para eliminar un producto por ID
router.delete('/productos/:id', (req, res) => {
  const productId = req.params.id;
  const query = 'DELETE FROM producto WHERE id = ?';

  db.query(query, [productId], (error) => {
    if (error) {
      console.error('Error al eliminar el producto:', error);
      res.status(500).json({ message: 'Error al eliminar el producto' });
    } else {
      res.status(200).json({ message: 'Producto eliminado exitosamente' });
    }
  });
});

// Ruta para obtener un producto por ID
router.get('/productos/:id', (req, res) => {
  const productId = req.params.id;
  const query = 'SELECT * FROM producto WHERE id = ?';

  db.query(query, [productId], (error, results) => {
    if (error) {
      console.error('Error al obtener el producto:', error);
      res.status(500).json({ error: 'Error al obtener el producto' });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
    } else {
      res.json(results[0]);
    }
  });
});

// Ruta para actualizar un producto por ID
router.put('/productos/:id', (req, res) => {
  const productId = req.params.id;
  const { nombre, imagen, descripcion, precio, stock } = req.body;
  const query = 'UPDATE producto SET nombre = ?, imagen = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?';
  const values = [nombre, imagen, descripcion, precio, stock, productId];

  db.query(query, values, (error) => {
    if (error) {
      console.error('Error al actualizar el producto:', error);
      res.status(500).json({ message: 'Error al actualizar el producto' });
    } else {
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
    }
  });
});

// Ruta para verificar las credenciales de inicio de sesión
router.get('/api/login', (req, res) => {
  const { user, password } = req.query;
  const query = 'SELECT * FROM usuario WHERE usuario = ? AND password = ?';

  db.query(query, [user, password], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error en el servidor' });
    } else if (results.length === 0) {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    } else {
      const { role: userRole, id: userId } = results[0];
      res.status(200).json({ success: true, message: 'Credenciales correctas', rol: userRole, id: userId });
    }
  });
});

// Ruta para obtener una lista de productos
router.get('/api/productos', (req, res) => {
  const query = 'SELECT id, nombre FROM producto';

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Ruta para guardar un pedido
router.post('/api/pedidos', (req, res) => {
  const { usuario_id, nombreProducto, fecha, cantidad } = req.body;
  const getProductQuery = 'SELECT id FROM producto WHERE nombre = ?';

  db.query(getProductQuery, [nombreProducto], (getProductError, getProductResults) => {
    if (getProductError) {
      console.error('Error al obtener el ID del producto:', getProductError);
      res.status(500).json({ message: 'Error al obtener el ID del producto' });
    } else if (getProductResults.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
    } else {
      const producto_id = getProductResults[0].id;
      const insertQuery = 'INSERT INTO pedido (usuario_id, producto_id, fecha, cantidad) VALUES (?, ?, ?, ?)';
      const insertValues = [usuario_id, producto_id, fecha, cantidad];

      db.query(insertQuery, insertValues, (insertError) => {
        if (insertError) {
          console.error('Error al guardar el pedido:', insertError);
          res.status(500).json({ message: 'Error al guardar el pedido' });
        } else {
          // Actualiza el número de ventas
          const updateQuery = 'UPDATE producto SET ventas = ventas + ? WHERE id = ?';
          const updateValues = [cantidad, producto_id];

          db.query(updateQuery, updateValues, (updateError) => {
            if (updateError) {
              console.error('Error al actualizar las ventas:', updateError);
              res.status(500).json({ message: 'Error al actualizar las ventas' });
            } else {
              // Actualiza el stock
              const updateStockQuery = 'UPDATE producto SET stock = stock - ? WHERE id = ?';
              const updateStockValues = [cantidad, producto_id];

              db.query(updateStockQuery, updateStockValues, (updateStockError) => {
                if (updateStockError) {
                  console.error('Error al actualizar el stock:', updateStockError);
                  res.status(500).json({ message: 'Error al actualizar el stock' });
                } else {
                  res.status(200).json({ message: 'Pedido y stock actualizados exitosamente' });
                }
              });
            }
          });
        }
      });
    }
  });
});

// Ruta para obtener el perfil de un usuario por ID
router.get('/perfil/:id', (req, res) => {
  const usuarioId = req.params.id;

  const query = 'SELECT * FROM perfil_usuario WHERE id = ?';
  db.query(query, [usuarioId], (error, results) => {
    if (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      res.status(500).json({ message: 'Error al obtener el perfil del usuario' });
    } else {
      if (results.length > 0) {
        res.json(results[0]); // Devuelve el perfil del usuario
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
      }
    }
  });
});

// Ruta para actualizar el perfil de un usuario por ID
router.put('/perfil/:id', (req, res) => {
  const usuarioId = req.params.id;
  const { nombre, correo_electronico, direccion, telefono } = req.body; // Campos del perfil a actualizar

  const query = 'UPDATE perfil_usuario SET nombre = ?, correo_electronico = ?, direccion = ?, telefono = ? WHERE id = ?';
  const values = [nombre, correo_electronico, direccion, telefono, usuarioId];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al actualizar el perfil del usuario:', error);
      res.status(500).json({ message: 'Error al actualizar el perfil del usuario' });
    } else {
      console.log('Perfil del usuario actualizado exitosamente');
      res.status(200).json({ message: 'Perfil del usuario actualizado exitosamente' });
    }
  });
});

// Endpoint para registrar un nuevo usuario en la tabla `usuario`
router.post('/usuarios', (req, res) => {
  const { usuario, contrasena } = req.body;
  const role = 'user';

  const queryUsuario = 'INSERT INTO usuario (usuario, password, role) VALUES (?, ?, ?)';
  const valuesUsuario = [usuario, contrasena, role];

  db.query(queryUsuario, valuesUsuario, (error, results) => {
    if (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(500).json({ message: 'Error al registrar el usuario' });
    } else {
      const usuarioId = results.insertId;
      res.status(201).json({ usuarioId });
    }
  });
});

// Endpoint para registrar el perfil en la tabla `perfil_usuario`
router.post('/perfil_usuario', (req, res) => {
  const { usuarioId, nombre, correo, direccion, telefono } = req.body;

  const queryPerfil = 'INSERT INTO perfil_usuario (usuario_id, nombre, correo_electronico, direccion, telefono) VALUES (?, ?, ?, ?, ?)';
  const valuesPerfil = [usuarioId, nombre, correo, direccion, telefono];

  db.query(queryPerfil, valuesPerfil, (error, results) => {
    if (error) {
      console.error('Error al registrar el perfil:', error);
      res.status(500).json({ message: 'Error al registrar el perfil' });
    } else {
      res.status(201).json({ message: 'Perfil registrado exitosamente' });
    }
  });
});


module.exports = router;
