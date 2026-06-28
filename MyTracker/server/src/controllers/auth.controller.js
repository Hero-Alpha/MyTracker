const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res) {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const hashed = await bcrypt.hash(password, 12);
  const user   = await User.create({ email, password: hashed, name });

  const token = signToken(user._id);
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({
    user: { id: user._id, email: user.email, name: user.name, profileComplete: user.profileComplete },
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match)  return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user._id);
  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({
    user: { id: user._id, email: user.email, name: user.name, profileComplete: user.profileComplete },
  });
}

async function logout(req, res) {
  res.clearCookie('token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
  res.json({ message: 'Logged out' });
}

async function me(req, res) {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
}

module.exports = { register, login, logout, me };
