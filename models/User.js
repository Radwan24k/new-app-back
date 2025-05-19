const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    first: { type: String, required: true },
    middle: { type: String },
    last: { type: String, required: true },
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zip: { type: String },
    country: { type: String, required: true },
  },
  isBusiness: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
