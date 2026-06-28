const express = require('express');
const { getTemplates, createTemplate, updateTemplate, deleteTemplate } = require('../controllers/workouts.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/',        protect, getTemplates);
router.post('/',       protect, createTemplate);
router.put('/:id',    protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);

module.exports = router;
