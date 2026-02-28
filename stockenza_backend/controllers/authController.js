const User = require('../models/User');
const jwt  = require('jsonwebtoken');

/* ── Token factory ── */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/* ── Safe user payload (never expose password hash) ── */
const userPayload = (user, token) => ({
  _id:   user._id,
  name:  user.name,
  email: user.email,
  token,
});

/**
 * POST /api/auth/register
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Normalise email
    const normEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normEmail });
    if (exists) {
      return res.status(400).json({ message: 'An account with that email already exists.' });
    }

    const user = await User.create({ name: name.trim(), email: normEmail, password });

    return res.status(201).json(userPayload(user, generateToken(user._id)));
  } catch (err) {
    console.error('[registerUser]', err.message);
    return res.status(500).json({ message: 'Server error — could not create account.' });
  }
};

/**
 * POST /api/auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normEmail = email.toLowerCase().trim();
    const user      = await User.findOne({ email: normEmail });

    if (!user || !(await user.matchPassword(password))) {
      // Intentionally vague — don't reveal whether email exists
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.status(200).json(userPayload(user, generateToken(user._id)));
  } catch (err) {
    console.error('[loginUser]', err.message);
    return res.status(500).json({ message: 'Server error — could not sign in.' });
  }
};

module.exports = { registerUser, loginUser };