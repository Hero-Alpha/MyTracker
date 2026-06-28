const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { geminiLimiter } = require('../middleware/rateLimiter');
const { getLatestReview, generateReview } = require('../controllers/review.controller');

router.get('/latest',   protect, getLatestReview);
router.post('/generate', protect, geminiLimiter, generateReview);

module.exports = router;
