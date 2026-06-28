const express = require('express');
const { getMeasurements, getLatest, addMeasurement } = require('../controllers/measurements.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/',        protect, getMeasurements);
router.get('/latest',  protect, getLatest);
router.post('/',       protect, addMeasurement);

module.exports = router;
