const express = require('express');
const router = express.Router();
const db = require('./bdd'); // Importa el archivo de configuración de la base de datos

// Ruta para obtener los datos de los productos de la base de datos
router.get('/api/datos', (req, res) => {
  // Realiza la consulta a la base de datos para obtener los datos necesarios
  db.query('SELECT * FROM producto', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los datos de la base de datos' });
    } else {
      res.json(results); // Devuelve los datos obtenidos de la base de datos como respuesta
    }
  });
});

// Ruta para guardar el producto
router.post('/productos', (req, res) => {
  const ventainicial = 0;
  const { nombre, imagen, descripcion, precio, stock } = req.body;

  // Realiza la inserción en la base de datos
  const query = 'INSERT INTO producto (nombre, imagen, descripcion, precio, stock, ventas) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [nombre, imagen, descripcion, precio, stock, ventainicial];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al guardar el producto:', error);
      res.status(500).json({ message: 'Error al guardar el producto' });
    } else {
      console.log('Producto guardado exitosamente');
      res.status(200).json({ message: 'Producto guardado exitosamente' });
    }
  });
});


// Ruta para eliminar un producto por su ID
router.delete('/productos/:id', (req, res) => {
  const productId = req.params.id;

  // Realiza la operación de borrado en la base de datos
  const query = 'DELETE FROM producto WHERE id = ?';
  const values = [productId];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al eliminar el producto:', error);
      res.status(500).json({ message: 'Error al eliminar el producto' });
    } else {
      console.log('Producto eliminado exitosamente');
      res.status(200).json({ message: 'Producto eliminado exitosamente' });
    }
  });
});

// Ruta para obtener los datos de un producto por su ID
router.get('/productos/:id', (req, res) => {
  const productId = req.params.id;
  
  // Realiza la consulta a la base de datos para obtener los datos del producto por su ID
  const query = 'SELECT * FROM producto WHERE id = ?';
  const values = [productId];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos del producto:', error);
      res.status(500).json({ error: 'Error al obtener los datos del producto' });
    } else {
      if (results.length > 0) {
        const producto = results[0];
        res.json(producto); // Devuelve los datos del producto como respuesta
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    }
  });
});

// Ruta para actualizar un producto por su ID
router.put('/productos/:id', (req, res) => {
  const productId = req.params.id;
  const { nombre, imagen, descripcion, precio, stock } = req.body;

  // Realiza la actualización en la base de datos
  const query = 'UPDATE producto SET nombre = ?, imagen = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?';
  const values = [nombre, imagen, descripcion, precio, stock, productId];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al actualizar el producto:', error);
      res.status(500).json({ message: 'Error al actualizar el producto' });
    } else {
      console.log('Producto actualizado exitosamente');
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
    }
  });
});


// Ruta para verificar las credenciales de inicio de sesión
router.get('/api/login', (req, res) => {
  const { user, password } = req.query;

  // Consultar la base de datos para verificar las credenciales
  const query = 'SELECT * FROM usuario WHERE usuario = ? AND password = ?';
  db.query(query, [user, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
      
    }
    console.log(results[0].role);
    console.log(results[0].id);

    const userRole = results[0].role;
    const userId = results[0].id;

    // Las credenciales son correctas, puedes devolver una respuesta exitosa
    return res.status(200).json({ success: true, message: 'Credenciales correctas', rol: userRole, id: userId });
    
  });
});

router.get('/api/productos', (req, res) => {
  // Consultar la base de datos para obtener los productos
  const query = 'SELECT id, nombre FROM producto';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    // Devolver los productos en la respuesta
    return res.status(200).json(results);
  });
});

// Ruta para guardar el pedido
router.post('/api/pedidos', (req, res) => {
  const { usuario_id, nombreProducto, fecha, cantidad } = req.body;

  // Obtener el ID del producto a partir del nombre
  const getProductQuery = 'SELECT id FROM producto WHERE nombre = ?';
  const getProductValues = [nombreProducto.toString()];

  db.query(getProductQuery, getProductValues, (getProductError, getProductResults) => {
    if (getProductError) {
      console.error('Error al obtener el ID del producto:', getProductError);
      res.status(500).json({ message: 'Error al obtener el ID del producto' });
    } else {
      if (getProductResults.length === 0) {
        console.error('No se encontró el producto con el nombre especificado');
        res.status(404).json({ message: 'No se encontró el producto con el nombre especificado' });
      } else {
        console.log('Producto encontrado:', getProductResults[0]);
        const producto_id = getProductResults[0].id;
        console.log('ID del producto:', producto_id);

        // Realizar la inserción en la base de datos
        const insertQuery = 'INSERT INTO pedido (usuario_id, producto_id, fecha, cantidad) VALUES (?, ?, ?, ?)';
        const insertValues = [usuario_id, producto_id, fecha, cantidad];

        db.query(insertQuery, insertValues, (insertError, insertResults) => {
          if (insertError) {
            console.error('Error al guardar el pedido:', insertError);
            res.status(500).json({ message: 'Error al guardar el pedido' });
          } else {
            console.log('Pedido guardado exitosamente');
      
            // Actualiza el número de ventas del producto
            const updateQuery = 'UPDATE producto SET ventas = ventas + ? WHERE id = ?';
            const updateValues = [cantidad, producto_id];
      
            db.query(updateQuery, updateValues, (updateError, updateResults) => {
              if (updateError) {
                console.error('Error al actualizar el número de ventas del producto:', updateError);
                res.status(500).json({ message: 'Error al actualizar el número de ventas del producto' });
              } else {
                console.log('Número de ventas del producto actualizado exitosamente');
                res.status(200).json({ message: 'Pedido guardado exitosamente' });

                // Actualiza el stock del producto
                const updateStockQuery = 'UPDATE producto SET stock = stock - ? WHERE id = ?';
                const updateStockValues = [cantidad, producto_id];

                db.query(updateStockQuery, updateStockValues, (updateStockError, updateStockResults) => {
                  if (updateStockError) {
                    console.error('Error al actualizar el stock del producto:', updateStockError);
                    res.status(500).json({ message: 'Error al actualizar el stock del producto' });
                  } else {
                    console.log('Stock del producto actualizado exitosamente');
                  }
                }
                );
              }
            });
          }
        });
      }
    }
  });
});

module.exports = router;

