const {
  listProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  countProductsByUser,
} = require('../models/productModel');

function canManage(user, product) {
  return user.role === 'admin' || Number(product.createdBy) === Number(user.id);
}

function parseProductInput(body) {
  const { name, description, price } = body || {};

  if (!name || String(name).trim().length === 0) {
    return { error: 'El nombre del producto es obligatorio' };
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return { error: 'El precio debe ser un número mayor o igual a 0' };
  }

  return {
    name: String(name).trim(),
    description: description ? String(description).trim() : null,
    price: parsedPrice,
  };
}

// GET /api/products
async function index(req, res) {
  try {
    const products = await listProducts();
    return res.json({ products });
  } catch (err) {
    console.error('[productController.index]', err);
    return res.status(500).json({ message: 'Error obteniendo el catálogo' });
  }
}

// GET /api/products/:id
async function show(req, res) {
  try {
    const product = await findProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    return res.json({ product });
  } catch (err) {
    console.error('[productController.show]', err);
    return res.status(500).json({ message: 'Error obteniendo el producto' });
  }
}

// POST /api/products — created_by sale del JWT.
async function store(req, res) {
  try {
    const parsed = parseProductInput(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const product = await createProduct({
      ...parsed,
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

// PUT /api/products/:id
async function update(req, res) {
  try {
    const current = await findProductById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Producto no encontrado' });
    if (!canManage(req.user, current)) {
      return res.status(403).json({ message: 'No puedes editar un producto de otro usuario' });
    }

    const parsed = parseProductInput(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const product = await updateProduct({
      id: current.id,
      ...parsed,
      creatorUsername: current.creator.username,
    });

    const io = req.app.get('io');
    if (io) io.emit('product-updated', { product });

    return res.json({ product });
  } catch (err) {
    console.error('[productController.update]', err);
    return res.status(500).json({ message: 'Error actualizando el producto' });
  }
}

// DELETE /api/products/:id
async function destroy(req, res) {
  try {
    const current = await findProductById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Producto no encontrado' });
    if (!canManage(req.user, current)) {
      return res.status(403).json({ message: 'No puedes eliminar un producto de otro usuario' });
    }

    await deleteProduct(current.id);
    const productsCount = await countProductsByUser(current.createdBy);

    const io = req.app.get('io');
    if (io) {
      io.emit('product-deleted', {
        id: current.id,
        userId: current.createdBy,
        productsCount,
      });
    }

    return res.status(200).json({ ok: true, id: current.id, productsCount });
  } catch (err) {
    console.error('[productController.destroy]', err);
    return res.status(500).json({ message: 'Error eliminando el producto' });
  }
}

module.exports = { index, show, store, update, destroy };
