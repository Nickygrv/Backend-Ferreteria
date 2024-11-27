import { createConnection } from './bdd.js';
const db = createConnection();
import express from 'express';
import routes from './routes.js';
const router = express.Router();

// Ruta para obtener todos los productos
router.get('/api/pedidos', (req, res) => {
  const query = 'SELECT * FROM pedido';  // La consulta a tu base de datos
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error al obtener los pedidos', error });
    }
    return res.status(200).json(results);  // Devuelve los resultados
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

// Ruta para obtener productos con su id y nombre
router.get('/api/productos', (req, res) => {
  const query = 'SELECT id, nombre, precio FROM producto';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error en la consulta SQL:', err); // Log de errores
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      console.log('Resultados de la consulta:', results); // Log para revisar los datos
      res.status(200).json(results);
    }
  });
});

// Ruta para obtener todos los pedidos
router.get('/api/pedidos', (req, res) => {
  const query = 'SELECT * FROM pedido'; // Ajusta la consulta según tu base de datos
  db.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ message: 'Error al obtener los pedidos', error });
    } else {
      res.status(200).json(results); // Devuelve los resultados (pedidos) al frontend
    }
  });
});

// Ruta para registrar un nuevo pedido
router.post('/api/pedidos', async (req, res) => {
  const { usuario_id, nombreProducto, cantidad, fecha } = req.body;

  try {
    // 1. Validar que el producto existe y obtener su stock actual
    const [producto] = await db.query(
      'SELECT id, stock FROM producto WHERE nombre = ?',
      [nombreProducto]
    );

    if (!producto || producto.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoId = producto[0].id;
    const stockActual = producto[0].stock;

    // 2. Verificar si hay stock suficiente
    if (cantidad > stockActual) {
      return res.status(400).json({
        error: `Stock insuficiente. Solo hay ${stockActual} unidades disponibles.`,
      });
    }

    // 3. Registrar el pedido en la tabla de pedidos
    const [result] = await db.query(
      'INSERT INTO pedidos (usuario_id, producto_id, cantidad, fecha) VALUES (?, ?, ?, ?)',
      [usuario_id, productoId, cantidad, fecha]
    );

    // 4. Calcular la fecha límite para la recogida (24 horas después)
    const fechaLimite = new Date();
    fechaLimite.setHours(fechaLimite.getHours() + 24); // 24 horas después

    // 5. Actualizar el stock del producto en la base de datos
    const nuevoStock = stockActual - cantidad;
    await db.query('UPDATE producto SET stock = ? WHERE id = ?', [
      nuevoStock,
      productoId,
    ]);

    // 6. Responder con éxito, incluyendo la fecha de recogida
    res.status(201).json({
      message: 'Pedido registrado exitosamente',
      fechaLimite: fechaLimite.toISOString(), // Devolver la fecha límite
    });
  } catch (error) {
    console.error('Error al registrar el pedido:', error);
    res.status(500).json({ error: 'Error al registrar el pedido' });
  }
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

// Ruta para registrar un nuevo usuario
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

// Ruta para registrar el perfil de un usuario
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

// Ruta para obtener todos los usuarios
router.get('/api/usuarios', (req, res) => {
  db.query('SELECT * FROM usuario', (error, results) => {
    if (error) {
      console.error('Error al obtener los datos de la base de datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos de la base de datos' });
    } else {
      res.json(results);
    }
  });
});

// Ruta para obtener detalles del usuario y su perfil por ID
router.get('/api/usuarios/detalles/:id', (req, res) => {
  const usuarioId = req.params.id;

  const query = `
      SELECT u.id, u.usuario, u.role, p.nombre, p.correo_electronico, p.direccion, p.telefono
      FROM usuario u
      LEFT JOIN perfil_usuario p ON u.id = p.usuario_id
      WHERE u.id = ?`;

  db.query(query, [usuarioId], (error, results) => {
      if (error) {
          console.error('Error al obtener los detalles del usuario:', error);
          res.status(500).json({ message: 'Error al obtener los detalles del usuario' });
      } else if (results.length === 0) {
          res.status(404).json({ message: 'Usuario no encontrado' });
      } else {
          res.status(200).json(results[0]); // Devuelve el primer resultado
      }
  });
});

export default router;
