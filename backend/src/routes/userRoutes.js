const { Router } = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { myStats } = require('../controllers/userController');

const router = Router();

router.get('/me/stats', requireAuth, myStats);

module.exports = router;
