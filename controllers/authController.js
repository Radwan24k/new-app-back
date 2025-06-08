const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.object({
    first: Joi.string().required(),
    middle: Joi.string().allow(''),
    last: Joi.string().required(),
  }).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().allow(''),
    zip: Joi.string().allow(''),
    country: Joi.string().required(),
  }).required(),
  isBusiness: Joi.boolean(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Register a new user
exports.register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      console.error('Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, phone, address, isBusiness } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      isBusiness,
    });

    await newUser.save();

    const token = jwt.sign(
      { _id: newUser._id, isBusiness: newUser.isBusiness, isAdmin: newUser.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
  } catch (err) {
    console.error('Server error during registration:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track failed login attempts
const failedLoginAttempts = new Map();

// Login a user
exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Check if user is blocked and if block has expired
    if (user.isBlocked) {
      if (user.blockExpires && user.blockExpires > new Date()) {
        const minutes = Math.ceil((user.blockExpires - new Date()) / 60000);
        return res.status(403).json({ message: `User is blocked. Try again in ${minutes} minutes.` });
      } else {
        // Unblock user if block has expired
        user.isBlocked = false;
        user.blockExpires = null;
        await user.save();
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Increment failed login attempts
      const attempts = failedLoginAttempts.get(email) || 0;
      failedLoginAttempts.set(email, attempts + 1);

      if (attempts + 1 >= 3) {
        user.isBlocked = true;
        user.blockExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();
        return res.status(403).json({ message: 'User is blocked due to multiple failed login attempts. Try again in 24 hours.' });
      }

      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Reset failed login attempts on successful login
    failedLoginAttempts.delete(email);

    const token = jwt.sign(
      { _id: user._id, isBusiness: user.isBusiness, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
