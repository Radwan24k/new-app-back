const express = require('express');
const {
  getAllCards,
  getMyCards,
  getCardById,
  createCard,
  updateCard,
  likeCard,
  deleteCard,
} = require('../controllers/cardController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware to protect routes
router.use(authMiddleware);

// Card routes
router.get('/', getAllCards);
router.get('/my-cards', getMyCards);
router.get('/:id', getCardById);
router.post('/', createCard);
router.put('/:id', updateCard);
router.patch('/:id', likeCard);
router.delete('/:id', deleteCard);

module.exports = router;
