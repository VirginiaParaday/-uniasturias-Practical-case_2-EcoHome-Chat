const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { findByUsername, createUser } = require('../models/userModel');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

// POST /api/auth/register
// Se incluye para poder crear usuarios de prueba sin tocar la base de datos a mano.
// (La fase anterior ya asume una base de usuarios existente; esto es un extra util.)
async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email y password son obligatorios' });
    }

    const existing = await findByUsername(username);
    if (existing) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ username, email, passwordHash, role });

    return res.status(201).json({ user });
  } catch (err) {
    console.error('[authController.register]', err);
    return res.status(500).json({ message: 'Error interno al registrar usuario' });
  }
}

// POST /api/auth/login
// Autenticacion real contra la base de datos de usuarios (Actividad 2, Entregable 1).
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username y password son obligatorios' });
    }

    const user = await findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return res.status(500).json({ message: 'Error interno al iniciar sesion' });
  }
}

// GET /api/auth/me  (requiere JWT) - util para validar el token desde el frontend
function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, me, signToken };
