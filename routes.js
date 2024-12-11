import { createConnection } from './bdd.js'; // Importar conexión a la base de datos
import express from 'express';

const db = createConnection(); // Crear conexión a la base de datos
const router = express.Router(); // Inicializar el enrutador

// Ruta para obtener todos los pedidos con detalles adicionales (nombre de usuario y producto)
router.get('/api/pedidos/detallados', (req, res) => {
  const query = `
    SELECT 
      p.id AS pedido_id,
      p.usuario_id,
      p.producto_id,
      p.fecha,
      p.estado,
      pu.nombre AS nombre_usuario,        
      pr.nombre AS nombre_producto       
    FROM pedido p
    JOIN perfil_usuario pu ON p.usuario_id = pu.id     
    JOIN producto pr ON p.producto_id = pr.id          
  `;

  db.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ message: 'Error al obtener los pedidos', error });
    } else {
      res.status(200).json(results);
    }
  });
});

// Ruta para obtener todos los productos
router.get('/api/datos', (req, res) => {
  const query = 'SELECT * FROM producto';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los productos:', error);
      res.status(500).json({ error: 'Error al obtener los productos' });
    } else {
      res.json(results);
    }
  });
});

// Nueva Ruta para obtener productos filtrados con paginación
router.get('/api/productos-filtrados', (req, res) => {
  const { min, max, page, size, filter } = req.query;

  const minPrice = parseFloat(min) || 0;
  const maxPrice = parseFloat(max) || Number.MAX_VALUE;
  const pageNumber = parseInt(page) || 0;
  const pageSize = parseInt(size) || 10;
  const searchFilter = filter ? `%${filter.toLowerCase()}%` : '%';

  // Consulta SQL para obtener productos filtrados
  const offset = pageNumber * pageSize;

  const query = `
    SELECT SQL_CALC_FOUND_ROWS id, nombre, precio 
    FROM producto 
    WHERE precio BETWEEN ? AND ? 
    AND LOWER(nombre) LIKE ?
    LIMIT ? OFFSET ?
  `;

  db.query(query, [minPrice, maxPrice, searchFilter, pageSize, offset], (error, products) => {
    if (error) {
      console.error('Error al cargar los productos filtrados:', error);
      res.status(500).json({ message: 'Error al cargar los productos filtrados', error });
    } else {
      // Obtener el número total de productos filtrados
      db.query('SELECT FOUND_ROWS() as total', (error, totalResults) => {
        if (error) {
          console.error('Error al obtener el total de productos:', error);
          res.status(500).json({ message: 'Error al obtener el total de productos' });
        } else {
          res.json({
            products: products,
            total: totalResults[0].total
          });
        }
      });
    }
  });
});

// Ruta para guardar un producto
router.post('/productos', (req, res) => {
  const { nombre, imagen, descripcion, precio, stock } = req.body;

  // Validación de campos obligatorios
  if (!nombre || !precio || !descripcion || !stock) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  if (precio <= 0 || stock <= 0) {
    return res.status(400).json({ message: 'El precio y el stock deben ser mayores a 0' });
  }

  const ventainicial = 0;
  const query = 'INSERT INTO producto (nombre, imagen, descripcion, precio, stock, ventas) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [nombre, imagen, descripcion, precio, stock, ventainicial];

  db.query(query, values, (error) => {
    if (error) {
      console.error('Error al guardar el producto:', error);
      res.status(500).json({ message: 'Error al guardar el producto' });
    } else {
      res.status(201).json({ message: 'Producto guardado exitosamente' });
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
  const { nombre, imagen, descripcion, precio, stock } = req.body;

  // Validación de campos obligatorios
  if (!nombre || !precio || !descripcion || !stock) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  if (precio <= 0 || stock <= 0) {
    return res.status(400).json({ message: 'El precio y el stock deben ser mayores a 0' });
  }

  const query = 'UPDATE producto SET nombre = ?, imagen = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?';
  const values = [nombre, imagen, descripcion, precio, stock, req.params.id];

  db.query(query, values, (error, results) => {
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

  db.query(query, [user, password], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Error en el servidor' });
    } else if (results.length === 0) {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    } else {
      const { role: userRole, id: userId } = results[0];
      res.status(200).json({ success: true, message: 'Credenciales correctas', rol: userRole, id: userId });
    }
  });
});

// Ruta para registrar un pedido
router.post('/api/pedidos', (req, res) => {
  const { usuario_id, producto_id, cantidad, fecha } = req.body;

  const insertQuery = 'INSERT INTO pedido (usuario_id, producto_id, cantidad, fecha) VALUES (?, ?, ?, ?)';
  const updateStockQuery = 'UPDATE producto SET stock = stock - ? WHERE id = ?';

  db.query(insertQuery, [usuario_id, producto_id, cantidad, fecha], (error) => {
    if (error) {
      console.error('Error al registrar el pedido:', error);
      res.status(500).json({ message: 'Error al registrar el pedido' });
    } else {
      db.query(updateStockQuery, [cantidad, producto_id], (error) => {
        if (error) {
          console.error('Error al actualizar el stock:', error);
          res.status(500).json({ message: 'Error al actualizar el stock' });
        } else {
          res.status(201).json({ message: 'Pedido registrado exitosamente' });
        }
      });
    }
  });
});

// Ruta para obtener los detalles del usuario y su perfil por ID
router.get('/api/usuarios/detalles/:id', (req, res) => {
  const usuarioId = req.params.id;
  const query = 'SELECT * FROM perfil_usuario WHERE id = ?';

  db.query(query, [usuarioId], (error, results) => {
    if (error) {
      console.error('Error al obtener los detalles del usuario:', error);
      return res.status(500).json({ message: 'Error al obtener los detalles del usuario' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(results[0]);  // Devuelve los detalles del usuario
  });
});


// Ruta para obtener todos los usuarios
router.get('/api/usuarios', (req, res) => {
  const query = 'SELECT id, usuario, role FROM usuario';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los usuarios:', error);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
    } else {
      res.status(200).json(results);
    }
  });
});

export default router;
