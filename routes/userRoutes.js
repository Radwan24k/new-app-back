const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  changeBusinessStatus,
  deleteUser,
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware to protect routes
router.use(authMiddleware);

// User routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id', changeBusinessStatus);
router.delete('/:id', deleteUser);

module.exports = router;
