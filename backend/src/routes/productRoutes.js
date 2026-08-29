const { Router } = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { index, show, store, update, destroy } = require('../controllers/productController');

const router = Router();

router.get('/', requireAuth, index);
router.get('/:id', requireAuth, show);
router.post('/', requireAuth, store);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, destroy);

module.exports = router;
