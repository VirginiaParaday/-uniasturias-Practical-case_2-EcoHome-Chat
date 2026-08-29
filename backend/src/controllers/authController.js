const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { findByUsername, findByEmail, createUser } = require('../models/userModel');
const { countProductsByUser } = require('../models/productModel');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

// POST /api/auth/signup  (alias: /api/auth/register)
// El signup público siempre crea rol "cliente". Devuelve JWT, igual que el login.
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email y password son obligatorios' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (await findByUsername(username)) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }
    if (await findByEmail(email)) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      passwordHash,
      role: 'cliente',
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        productsCount: 0,
      },
    });
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
    const productsCount = await countProductsByUser(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        productsCount,
      },
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return res.status(500).json({ message: 'Error interno al iniciar sesion' });
  }
}

// GET /api/auth/me  (requiere JWT) - valida el token y devuelve el contador de productos.
async function me(req, res) {
  try {
    const productsCount = await countProductsByUser(req.user.id);
    return res.json({
      user: { ...req.user, productsCount },
      stats: { productsCount },
    });
  } catch (err) {
    console.error('[authController.me]', err);
    return res.status(500).json({ message: 'Error obteniendo el perfil' });
  }
}

module.exports = { register, login, me, signToken };
