const express = require('express');
const { getLog, addMealItem, removeMealItem, addWater, logWeight, logWorkout } = require('../controllers/logs.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:date',                          protect, getLog);
router.post('/:date/meals/:meal',             protect, addMealItem);
router.delete('/:date/meals/:meal/:itemId',   protect, removeMealItem);
router.post('/:date/water',                   protect, addWater);
router.post('/:date/weight',                  protect, logWeight);
router.post('/:date/workout',                 protect, logWorkout);

module.exports = router;
