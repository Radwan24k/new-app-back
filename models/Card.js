const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  web: { type: String },
  image: { type: String },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zip: { type: String },
    country: { type: String, required: true },
  },
  bizNumber: { type: String, required: true, unique: true },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
