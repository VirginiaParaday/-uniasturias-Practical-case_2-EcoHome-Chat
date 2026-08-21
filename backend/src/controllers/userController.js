const { countProductsByUser } = require('../models/productModel');

// GET /api/users/me/stats
// Métrica simple de actividad: cuántos productos ha creado el usuario autenticado.
async function myStats(req, res) {
  try {
    const productsCount = await countProductsByUser(req.user.id);
    return res.json({
      username: req.user.username,
      productsCount,
    });
  } catch (err) {
    console.error('[userController.myStats]', err);
    return res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
}

module.exports = { myStats };
