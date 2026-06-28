const express = require('express');
const { search, createFood, getUserFoods } = require('../controllers/foods.controller');
const { protect } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/search',   protect, searchLimiter, search);
router.get('/mine',     protect, getUserFoods);
router.post('/',        protect, createFood);

module.exports = router;
