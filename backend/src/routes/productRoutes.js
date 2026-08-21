const { Router } = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { index, store } = require('../controllers/productController');

const router = Router();

router.get('/', requireAuth, index);
router.post('/', requireAuth, store);

module.exports = router;
