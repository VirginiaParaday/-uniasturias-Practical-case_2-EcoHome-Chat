const { listProducts, createProduct, countProductsByUser } = require('../models/productModel');

// GET /api/products
// Devuelve el catálogo con datos mínimos del creador (Actividad 2 y 3).
async function index(req, res) {
  try {
    const products = await listProducts();
    return res.json({ products });
  } catch (err) {
    console.error('[productController.index]', err);
    return res.status(500).json({ message: 'Error obteniendo el catálogo' });
  }
}

// POST /api/products
// El creador NUNCA se toma del body: sale del JWT (req.user).
async function store(req, res) {
  try {
    const { name, description, price } = req.body || {};

    if (!name || String(name).trim().length === 0) {
      return res.status(400).json({ message: 'El nombre del producto es obligatorio' });
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: 'El precio debe ser un número mayor o igual a 0' });
    }

    const product = await createProduct({
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      price: parsedPrice,
      createdBy: req.user.id,
      creatorUsername: req.user.username,
    });

    const productsCount = await countProductsByUser(req.user.id);

    const io = req.app.get('io');
    if (io) {
      io.emit('product-created', {
        product,
        userId: req.user.id,
        username: req.user.username,
        productsCount,
      });
    }

    return res.status(201).json({ product, productsCount });
  } catch (err) {
    console.error('[productController.store]', err);
    return res.status(500).json({ message: 'Error creando el producto' });
  }
}

module.exports = { index, store };
