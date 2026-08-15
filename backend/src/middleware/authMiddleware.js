const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// Middleware REST: exige "Authorization: Bearer <token>" valido.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    req.user = { id: payload.sub, username: payload.username, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
}

module.exports = { requireAuth };
