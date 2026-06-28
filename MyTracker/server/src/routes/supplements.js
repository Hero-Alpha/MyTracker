const express = require('express');
const multer = require('multer');
const { parseLabel, saveSupplement, getUserSupplements } = require('../controllers/supplements.controller');
const { protect } = require('../middleware/auth');
const { geminiLimiter } = require('../middleware/rateLimiter');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.post('/parse',  protect, geminiLimiter, upload.single('label'), parseLabel);
router.post('/',       protect, saveSupplement);
router.get('/',        protect, getUserSupplements);

module.exports = router;
