const Card = require('../models/Card');
const Joi = require('joi');

// Get all cards
exports.getAllCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all cards created by the logged-in user
exports.getMyCards = async (req, res) => {
  try {
    const cards = await Card.find({ user_id: req.user._id });
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific card
exports.getCardById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new card
exports.createCard = async (req, res) => {
  try {
    if (!req.user.isBusiness) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const schema = Joi.object({
      title: Joi.string().required(),
      subtitle: Joi.string().required(),
      description: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().required(),
      web: Joi.string().allow(''),
      image: Joi.string().allow(''),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().allow(''),
        zip: Joi.string().allow(''),
        country: Joi.string().required(),
      }).required(),
      bizNumber: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const card = new Card({
      ...req.body,
      user_id: req.user._id,
    });

    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit an existing card
exports.updateCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(card, req.body);
    await card.save();

    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Like a card
exports.likeCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (!card.likes.includes(req.user._id)) {
      card.likes.push(req.user._id);
    } else {
      card.likes = card.likes.filter((id) => id.toString() !== req.user._id.toString());
    }

    await card.save();
    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a card
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.user_id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await card.deleteOne();
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin-only: Edit card number
exports.editCardNumber = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { bizNumber } = req.body;

    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    card.bizNumber = bizNumber;
    await card.save();

    res.status(200).json({ message: 'Card number updated successfully', card });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
