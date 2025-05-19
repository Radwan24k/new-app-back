const User = require('../models/User');
const Joi = require('joi');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific user
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user._id !== user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit an existing user
exports.updateUser = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.object({
        first: Joi.string().optional(),
        middle: Joi.string().allow('').optional(),
        last: Joi.string().optional(),
      }).optional(),
      phone: Joi.string().optional(),
      address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().allow('').optional(),
        zip: Joi.string().allow('').optional(),
        country: Joi.string().optional(),
      }).optional(),
      email: Joi.string().email().optional(),
      password: Joi.string().min(6).optional(),
      isBusiness: Joi.boolean().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user._id !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(user, req.body);
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change a user's isBusiness status
exports.changeBusinessStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user._id !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    user.isBusiness = !user.isBusiness;
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user._id !== user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error during user deletion:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
